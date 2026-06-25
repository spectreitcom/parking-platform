import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { CartFacade } from 'src/modules/cart/application/cart.facade';
import { CreateCartDto } from '../dto/create-cart.dto';

@Injectable()
export class CreateCartHandler implements IControllerHandler {
  constructor(private readonly cartFacade: CartFacade) {}

  async handle(
    userId: string,
    dto: CreateCartDto,
  ): Promise<{ id: string }> {
    const id = await this.cartFacade.createCart(
      dto.parkingSpotId,
      dto.arrival,
      dto.departure,
      dto.pricePerDay,
      userId,
    );

    return { id };
  }
}
