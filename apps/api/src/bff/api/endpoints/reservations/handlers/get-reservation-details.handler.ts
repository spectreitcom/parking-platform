import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { AppError } from 'src/shared/errors';
import { PaymentFacade } from 'src/modules/payment/application/payment.facade';

type Response = {
  reservationId: string;
  cartId: string;
  total: number;
  parkingSpot: {
    id: string;
    price: number;
    pricePLN: number;
  };
  parking: {
    id: string;
    name: string;
    address: string;
  };
  userId: string;
  arrival: number;
  departure: number;
  lines: { title: string; price: number }[];
  status: string;
  registrationNumber: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  payment: {
    id: string;
    reservationId: string;
    userId: string;
    amount: number;
    createdAt: Date;
    paidAt: Date | null;
  } | null;
};

@Injectable()
export class GetReservationDetailsHandler implements IControllerHandler {
  constructor(
    private readonly reservationFacade: ReservationFacade,
    private readonly parkingFacade: ParkingFacade,
    private readonly paymentFacade: PaymentFacade,
  ) {}

  async handle(reservationId: string, userId: string) {
    const reservationDetails =
      await this.reservationFacade.getReservationDetails(reservationId, userId);

    const parkingDetails = await this.parkingFacade.getParkingById(
      reservationDetails.parkingId,
    );

    if (!parkingDetails) {
      throw new AppError('ENTITY_NOT_FOUND', `Parking not found`);
    }

    const parkingSpot = await this.parkingFacade.getParkingSpotById(
      reservationDetails.parkingSpotId,
    );

    if (!parkingSpot) {
      throw new AppError('ENTITY_NOT_FOUND', `Parking spot not found`);
    }

    const payment =
      await this.paymentFacade.getPaymentByReservationId(reservationId);

    return {
      reservationId: reservationDetails.reservationId,
      userId: reservationDetails.userId,
      arrival: reservationDetails.arrival / 1000,
      departure: reservationDetails.departure / 1000,
      cartId: reservationDetails.cartId,
      version: reservationDetails.version,
      registrationNumber: reservationDetails.registrationNumber,
      createdAt: reservationDetails.createdAt,
      updatedAt: reservationDetails.updatedAt,
      lines: reservationDetails.lines,
      parkingSpot: {
        id: parkingSpot.id,
        price: parkingSpot.price,
        pricePLN: parkingSpot.pricePLN,
      },
      parking: {
        id: parkingDetails.id,
        address: parkingDetails.address,
        name: parkingDetails.name,
      },
      status: reservationDetails.status,
      total: reservationDetails.total,
      payment,
    } satisfies Response;
  }
}
