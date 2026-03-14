import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateCartCommandHandler } from '../create-cart.command-handler';
import { CreateCartCommand } from '../../commands/create-cart.command';
import { CartRepository } from '../../ports/cart.repository';
import { randomUUID } from 'node:crypto';

describe('CreateCartCommandHandler', () => {
  let handler: CreateCartCommandHandler;
  let repository: jest.Mocked<CartRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCartCommandHandler,
        {
          provide: CartRepository,
          useValue: {
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

    handler = module.get<CreateCartCommandHandler>(CreateCartCommandHandler);
    repository = module.get(CartRepository);
    publisher = module.get(EventPublisher);
  });

  it('should create and save a new cart', async () => {
    const parkingSpotId = randomUUID();
    const userId = randomUUID();
    const arrival = Date.now();
    const departure = Date.now() + 1000 * 60 * 60 * 24;
    const pricePerDay = 100;

    const command = new CreateCartCommand(
      parkingSpotId,
      arrival,
      departure,
      pricePerDay,
      userId,
    );

    const cartId = await handler.execute(command);

    expect(cartId).toBeDefined();
    expect(publisher.mergeObjectContext).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(expect.anything(), {
      isNew: true,
    });
  });
});
