import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateCartCommand } from '../commands/create-cart.command';
import { CartRepository } from '../ports/cart.repository';
import { Cart } from '../../domain/cart';

@CommandHandler(CreateCartCommand)
export class CreateCartCommandHandler implements ICommandHandler<
  CreateCartCommand,
  string
> {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateCartCommand): Promise<string> {
    const { userId, departure, parkingSpotId, arrival, pricePerDay } = command;

    const cart = Cart.create(
      parkingSpotId,
      arrival,
      departure,
      pricePerDay,
      userId,
    );

    this.eventPublisher.mergeObjectContext(cart);
    await this.cartRepository.save(cart, { isNew: true });
    cart.commit();

    return cart.getId().value;
  }
}
