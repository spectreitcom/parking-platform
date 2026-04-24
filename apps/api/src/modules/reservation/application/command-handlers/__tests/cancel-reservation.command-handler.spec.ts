import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { CancelReservationCommandHandler } from '../cancel-reservation.command-handler';
import { ReservationRepository } from '../../ports/reservation.repository';
import { CancelReservationCommand } from '../../commands/cancel-reservation.command';
import { Reservation } from '../../../domain/reservation';
import { AppError } from 'src/shared/errors';

describe('CancelReservationCommandHandler', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let handler: CancelReservationCommandHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelReservationCommandHandler,
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

    handler = module.get<CancelReservationCommandHandler>(
      CancelReservationCommandHandler,
    );
    reservationRepository = module.get(ReservationRepository);
    eventPublisher = module.get(EventPublisher);
  });

  it('should cancel a reservation', async () => {
    const userId = randomUUID();
    const arrivalDate = Date.now() + 25 * 60 * 60 * 1000; // 25 hours from now
    const departureDate = arrivalDate + 2 * 60 * 60 * 1000;

    const reservation = Reservation.create(
      randomUUID(),
      randomUUID(),
      userId,
      arrivalDate,
      departureDate,
      [{ title: 'Parking', price: 100 }],
      'REG-123',
      [],
    );
    const reservationId = reservation.getId().value;
    reservationRepository.findByIdAndUserId.mockResolvedValue(reservation);

    const command = new CancelReservationCommand(
      reservationId,
      userId,
      reservation.getVersion().value,
    );

    const result = await handler.execute(command);

    expect(result).toBe(reservationId);
    expect(reservation.getStatus().value).toBe('CANCELLED');
    expect(reservationRepository.save).toHaveBeenCalledWith(reservation);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(reservation);
  });

  it('should throw ENTITY_NOT_FOUND if reservation does not exist', async () => {
    reservationRepository.findByIdAndUserId.mockResolvedValue(null);

    const command = new CancelReservationCommand(randomUUID(), randomUUID(), 1);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Reservation not found'),
    );
  });

  it('should throw CONCURRENCY if version mismatch', async () => {
    const userId = randomUUID();
    const reservation = Reservation.create(
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

    const command = new CancelReservationCommand(
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

  it('should throw SIMPLE_ERROR if domain logic throws CancellingReservationError', async () => {
    const userId = randomUUID();
    const arrivalDate = Date.now() + 1 * 60 * 60 * 1000; // 1 hour from now (too late to cancel without addon)
    const departureDate = arrivalDate + 2 * 60 * 60 * 1000;

    const reservation = Reservation.create(
      randomUUID(),
      randomUUID(),
      userId,
      arrivalDate,
      departureDate,
      [{ title: 'Parking', price: 100 }],
      'REG-123',
      [],
    );
    const reservationId = reservation.getId().value;
    reservationRepository.findByIdAndUserId.mockResolvedValue(reservation);

    const command = new CancelReservationCommand(
      reservationId,
      userId,
      reservation.getVersion().value,
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('SIMPLE_ERROR', 'Error during cancelling reservation'),
    );
  });
});
