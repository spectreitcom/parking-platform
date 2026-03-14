import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCartCommand } from './commands/create-cart.command';
import { UpdateCartCommand } from './commands/update-cart.command';
import { GetCartByIdQuery } from './queries/get-cart-by-id.query';
import { CartReadModel } from './query-handlers/read-models/cart.read-model';
import { CartAddonRaw } from './types';

@Injectable()
export class CartFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createCart(
    parkingSpotId: string,
    arrival: number,
    departure: number,
    pricePerDay: number,
    userId?: string,
  ): Promise<string> {
    return this.commandBus.execute(
      new CreateCartCommand(
        parkingSpotId,
        arrival,
        departure,
        pricePerDay,
        userId,
      ),
    );
  }

  async updateCart(
    cartId: string,
    arrival: number,
    departure: number,
    addons: CartAddonRaw[],
    userId?: string,
  ): Promise<string> {
    return this.commandBus.execute(
      new UpdateCartCommand(cartId, arrival, departure, addons, userId),
    );
  }

  async getCartById(cartId: string, userId?: string): Promise<CartReadModel> {
    return this.queryBus.execute(new GetCartByIdQuery(cartId, userId));
  }
}
