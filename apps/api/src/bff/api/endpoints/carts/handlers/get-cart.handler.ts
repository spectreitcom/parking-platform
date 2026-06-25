import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { CartFacade } from 'src/modules/cart/application/cart.facade';
import { CartReadModel } from 'src/modules/cart/application/query-handlers/read-models/cart.read-model';

@Injectable()
export class GetCartHandler implements IControllerHandler {
  constructor(private readonly cartFacade: CartFacade) {}

  async handle(
    cartId: string,
    userId: string,
  ): Promise<CartReadModel> {
    return await this.cartFacade.getCartById(cartId, userId);
  }
}
