import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { UpdateReservationCommandHandler } from '../update-reservation.command-handler';
import { ReservationRepository } from '../../ports/reservation.repository';
import { UpdateReservationCommand } from '../../commands/update-reservation.command';
import { Reservation } from '../../../domain/reservation';
import { AppError } from '../../../../../shared/errors';

describe('UpdateReservationCommandHandler', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let handler: UpdateReservationCommandHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateReservationCommandHandler,
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

    handler = module.get<UpdateReservationCommandHandler>(
      UpdateReservationCommandHandler,
    );
    reservationRepository = module.get(ReservationRepository);
    eventPublisher = module.get(EventPublisher);
  });

  it('should update a reservation', async () => {
    const userId = randomUUID();
    const arrivalDate = Date.now() + 25 * 60 * 60 * 1000;
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

    const newRegistrationNumber = 'NEW-REG-456';
    const command = new UpdateReservationCommand(
      reservationId,
      userId,
      reservation.getVersion().value,
      newRegistrationNumber,
    );

    const result = await handler.execute(command);

    expect(result).toBe(reservationId);
    expect(reservation.getRegistrationNumber().value).toBe(
      newRegistrationNumber,
    );
    expect(reservationRepository.save).toHaveBeenCalledWith(reservation);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(reservation);
  });

  it('should throw ENTITY_NOT_FOUND if reservation does not exist', async () => {
    reservationRepository.findByIdAndUserId.mockResolvedValue(null);

    const command = new UpdateReservationCommand(
      randomUUID(),
      randomUUID(),
      1,
      'NEW-REG',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Reservation not found'),
    );
  });

  it('should throw CONCURRENCY if version mismatch', async () => {
    const userId = randomUUID();
    const arrivalDate = Date.now() + 25 * 60 * 60 * 1000;
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

    const command = new UpdateReservationCommand(
      reservationId,
      userId,
      reservation.getVersion().value + 1, // Wrong version
      'NEW-REG',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Reservation with id ${reservationId} has been modified by another process`,
      ),
    );
  });

  it('should throw SIMPLE_ERROR if domain logic throws UpdateReservationError', async () => {
    const userId = randomUUID();
    const arrivalDate = Date.now() + 25 * 60 * 60 * 1000;
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
    // Cancel the reservation to trigger UpdateReservationError on update
    reservation.cancel();

    const reservationId = reservation.getId().value;
    reservationRepository.findByIdAndUserId.mockResolvedValue(reservation);

    const command = new UpdateReservationCommand(
      reservationId,
      userId,
      reservation.getVersion().value,
      'NEW-REG',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('SIMPLE_ERROR', 'Error during updating reservation'),
    );
  });
});
