import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { CompleteReservationCommandHandler } from '../complete-reservation.command-handler';
import { ReservationRepository } from '../../ports/reservation.repository';
import { CompleteReservationCommand } from '../../commands/complete-reservation.command';
import { Reservation } from '../../../domain/reservation';
import { AppError, ConcurrencyError } from 'src/shared/errors';

describe('CompleteReservationCommandHandler', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let handler: CompleteReservationCommandHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteReservationCommandHandler,
        {
          provide: ReservationRepository,
          useValue: {
            findByIdAndUserId: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            mergeObjectContext: jest.fn(<T>(obj: T): T => obj),
          },
        },
      ],
    }).compile();

    handler = module.get<CompleteReservationCommandHandler>(
      CompleteReservationCommandHandler,
    );
    reservationRepository = module.get(ReservationRepository);
    eventPublisher = module.get(EventPublisher);
  });

  it('should complete a reservation', async () => {
    const userId = randomUUID();
    const reservation = Reservation.create(
      randomUUID(),
      randomUUID(),
      randomUUID(),
      userId,
      Date.now() + 25 * 60 * 60 * 1000,
      Date.now() + 27 * 60 * 60 * 1000,
      [{ title: 'Parking', price: 100 }],
      'REG-123',
      [],
    );
    const reservationId = reservation.getId().value;
    reservationRepository.findByIdAndUserId.mockResolvedValue(reservation);

    const command = new CompleteReservationCommand(
      reservationId,
      userId,
      reservation.getVersion().value,
    );

    const result = await handler.execute(command);

    expect(result).toBe(reservationId);
    expect(reservation.getStatus().value).toBe('COMPLETED');
    expect(reservationRepository.save).toHaveBeenCalledWith(reservation);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(reservation);
  });

  it('should throw ENTITY_NOT_FOUND if reservation does not exist', async () => {
    reservationRepository.findByIdAndUserId.mockResolvedValue(null);

    const command = new CompleteReservationCommand(
      randomUUID(),
      randomUUID(),
      1,
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Reservation not found'),
    );
  });

  it('should throw CONCURRENCY if version mismatch', async () => {
    const userId = randomUUID();
    const reservation = Reservation.create(
      randomUUID(),
      randomUUID(),
      randomUUID(),
      userId,
      Date.now() + 25 * 60 * 60 * 1000,
      Date.now() + 27 * 60 * 60 * 1000,
      [{ title: 'Parking', price: 100 }],
      'REG-123',
      [],
    );
    const reservationId = reservation.getId().value;
    reservationRepository.findByIdAndUserId.mockResolvedValue(reservation);

    const command = new CompleteReservationCommand(
      reservationId,
      userId,
      reservation.getVersion().value + 1, // Wrong version
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Reservation with id ${reservationId} has been modified by another process`,
      ),
    );
  });

  it('should throw SIMPLE_ERROR if domain logic throws CompletingReservationError', async () => {
    const userId = randomUUID();
    const reservation = Reservation.create(
      randomUUID(),
      randomUUID(),
      randomUUID(),
      userId,
      Date.now() + 25 * 60 * 60 * 1000,
      Date.now() + 27 * 60 * 60 * 1000,
      [{ title: 'Parking', price: 100 }],
      'REG-123',
      [],
    );
    const reservationId = reservation.getId().value;

    // Set status to cancelled to trigger CompletingReservationError
    reservation.cancel();

    reservationRepository.findByIdAndUserId.mockResolvedValue(reservation);

    const command = new CompleteReservationCommand(
      reservationId,
      userId,
      reservation.getVersion().value,
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('SIMPLE_ERROR', 'Error during completing reservation'),
    );
  });

  it('should throw CONCURRENCY if repository.save throws ConcurrencyError', async () => {
    const userId = randomUUID();
    const reservation = Reservation.create(
      randomUUID(),
      randomUUID(),
      randomUUID(),
      userId,
      Date.now() + 25 * 60 * 60 * 1000,
      Date.now() + 27 * 60 * 60 * 1000,
      [{ title: 'Parking', price: 100 }],
      'REG-123',
      [],
    );
    const reservationId = reservation.getId().value;
    reservationRepository.findByIdAndUserId.mockResolvedValue(reservation);
    reservationRepository.save.mockRejectedValue(
      new ConcurrencyError('Reservation', reservationId),
    );

    const command = new CompleteReservationCommand(
      reservationId,
      userId,
      reservation.getVersion().value,
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Reservation with id ${reservationId} has been modified by another process`,
      ),
    );
  });
});
