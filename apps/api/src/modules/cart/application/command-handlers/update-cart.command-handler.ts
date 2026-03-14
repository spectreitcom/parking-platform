import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCartCommand } from '../commands/update-cart.command';
import { CartRepository } from '../ports/cart.repository';
import { AppError } from '../../../../shared/errors';

@CommandHandler(UpdateCartCommand)
export class UpdateCartCommandHandler implements ICommandHandler<
  UpdateCartCommand,
  string
> {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateCartCommand): Promise<string> {
    const { cartId, arrival, departure, addons } = command;

    const cart = await this.cartRepository.findById(cartId);

    if (!cart) {
      throw new AppError(
        'ENTITY_NOT_FOUND',
        `Cart with id ${cartId} not found`,
      );
    }

    this.eventPublisher.mergeObjectContext(cart);
    cart.update(arrival, departure, addons);

    await this.cartRepository.save(cart);
    cart.commit();

    return cart.getId().value;
  }
}
