import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { AppError } from 'src/shared/errors';
import { CartFacade } from 'src/modules/cart/application/cart.facade';

@Injectable()
export class CreateReservationHandler implements IControllerHandler {
  constructor(
    private readonly reservationFacade: ReservationFacade,
    private readonly parkingFacade: ParkingFacade,
    private readonly cartFacade: CartFacade,
  ) {}

  async handle(
    userId: string,
    dto: CreateReservationDto,
  ): Promise<{ id: string }> {
    const cart = await this.cartFacade.getCartById(dto.cartId);

    if (!cart) {
      throw new AppError('VALIDATION_ERROR', 'Cart not found');
    }

    const parking = await this.parkingFacade.getParkingByParkingSpotId(
      cart.parkingSpotId,
    );

    if (!parking) {
      throw new AppError('VALIDATION_ERROR', 'Parking not found');
    }

    const lines: { title: string; price: number }[] = [
      {
        title: 'Reservation',
        price: cart.pricePerDay * cart.days,
      },
    ];

    if (cart.addons.length) {
      const addons = await this.parkingFacade.getParkingAddonByIds(
        cart.addons.map((addon) => addon.id),
      );

      lines.push(
        ...addons.map((addon) => ({ title: addon.name, price: addon.price })),
      );
    }

    const id = await this.reservationFacade.createReservation(
      dto.cartId,
      userId,
      parking.id,
      cart.parkingSpotId,
      cart.arrival,
      cart.departure,
      dto.registrationNumber,
      lines,
      cart.addons.map((addon) => addon.id),
    );

    return { id };
  }
}
