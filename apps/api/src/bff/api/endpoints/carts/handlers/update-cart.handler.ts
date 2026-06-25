import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { CartFacade } from 'src/modules/cart/application/cart.facade';
import { UpdateCartDto } from '../dto/update-cart.dto';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';

@Injectable()
export class UpdateCartHandler implements IControllerHandler {
  constructor(
    private readonly cartFacade: CartFacade,
    private readonly parkingFacade: ParkingFacade,
  ) {}

  async handle(
    cartId: string,
    userId: string,
    dto: UpdateCartDto,
  ): Promise<{ id: string }> {
    const addons = await this.parkingFacade.getParkingAddonByIds(dto.addonIds);

    const id = await this.cartFacade.updateCart(
      cartId,
      dto.arrival,
      dto.departure,
      addons.map((addon) => ({ id: addon.id, price: addon.price })),
      userId,
    );

    return { id };
  }
}
