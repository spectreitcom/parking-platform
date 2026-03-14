import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdateCartCommandHandler } from '../update-cart.command-handler';
import { UpdateCartCommand } from '../../commands/update-cart.command';
import { CartRepository } from '../../ports/cart.repository';
import { Cart } from '../../../domain/cart';
import { randomUUID } from 'node:crypto';
import { AppError } from '../../../../../shared/errors';

describe('UpdateCartCommandHandler', () => {
  let handler: UpdateCartCommandHandler;
  let repository: jest.Mocked<CartRepository>;
  let publisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCartCommandHandler,
        {
          provide: CartRepository,
          useValue: {
            findById: jest.fn(),
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

    handler = module.get<UpdateCartCommandHandler>(UpdateCartCommandHandler);
    repository = module.get(CartRepository);
    publisher = module.get(EventPublisher);
  });

  it('should update and save an existing cart', async () => {
    const id = randomUUID();
    const cart = Cart.create(
      randomUUID(),
      Date.now(),
      Date.now() + 1000 * 60 * 60 * 24,
      100,
      randomUUID(),
    );
    repository.findById.mockResolvedValue(cart);

    const arrival = Date.now() + 1000 * 60 * 60;
    const departure = Date.now() + 1000 * 60 * 60 * 25;
    const addons = [{ id: randomUUID(), price: 50 }];

    const command = new UpdateCartCommand(id, arrival, departure, addons);

    await handler.execute(command);

    expect(repository.findById).toHaveBeenCalledWith(id);
    expect(publisher.mergeObjectContext).toHaveBeenCalledWith(cart);
    expect(repository.save).toHaveBeenCalledWith(cart);

    expect(cart.getDateRange().arrival).toBe(arrival);
    expect(cart.getDateRange().departure).toBe(departure);
    expect(cart.getAddons().length).toBe(1);
    expect(cart.getAddons()[0].id.value).toBe(addons[0].id);
  });

  it('should throw error if cart not found', async () => {
    const id = randomUUID();
    repository.findById.mockResolvedValue(null);

    const command = new UpdateCartCommand(
      id,
      Date.now(),
      Date.now() + 1000,
      [],
    );

    await expect(handler.execute(command)).rejects.toThrow(AppError);
  });
});
