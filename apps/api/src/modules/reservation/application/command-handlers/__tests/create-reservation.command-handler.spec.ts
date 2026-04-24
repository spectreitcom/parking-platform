import { Test, TestingModule } from '@nestjs/testing';
import { ReservationRepository } from '../../ports/reservation.repository';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateReservationCommandHandler } from '../create-reservation.command-handler';
import { randomUUID } from 'node:crypto';
import { CreateReservationCommand } from '../../commands/create-reservation.command';
import { Reservation } from '../../../domain/reservation';

describe('CreateReservationCommandHandler', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let handler: CreateReservationCommandHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReservationCommandHandler,
        {
          provide: ReservationRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            mergeObjectContext: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateReservationCommandHandler>(
      CreateReservationCommandHandler,
    );
    reservationRepository = module.get(ReservationRepository);
    eventPublisher = module.get(EventPublisher);
  });

  it('should create a reservation', async () => {
    const cartId = randomUUID();
    const userId = randomUUID();
    const parkingSpotId = randomUUID();

    const startDate = Date.now();
    const endDate = startDate + 24 * 60 * 60 * 1000;

    const command = new CreateReservationCommand(
      cartId,
      userId,
      parkingSpotId,
      startDate,
      endDate,
      'REG-123',
      [
        {
          title: 'Reservation',
          price: 10 * 100,
        },
        {
          title: 'Addon',
          price: 5 * 100,
        },
      ],
      [],
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalled();
    expect(reservationRepository.save).toHaveBeenCalledWith(
      expect.any(Reservation),
      { isNew: true },
    );
  });
});
