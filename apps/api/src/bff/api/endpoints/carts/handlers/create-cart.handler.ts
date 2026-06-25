import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { CartFacade } from 'src/modules/cart/application/cart.facade';
import { CreateCartDto } from '../dto/create-cart.dto';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { AppError } from 'src/shared/errors';

@Injectable()
export class CreateCartHandler implements IControllerHandler {
  constructor(
    private readonly cartFacade: CartFacade,
    private readonly parkingFacade: ParkingFacade,
  ) {}

  async handle(userId: string, dto: CreateCartDto): Promise<{ id: string }> {
    const parkingSpot = await this.parkingFacade.getParkingSpotById(
      dto.parkingSpotId,
    );

    if (!parkingSpot) {
      throw new AppError('VALIDATION_ERROR', 'Parking spot not found');
    }

    const id = await this.cartFacade.createCart(
      dto.parkingSpotId,
      dto.arrival,
      dto.departure,
      parkingSpot.price,
      userId,
    );

    return { id };
  }
}
