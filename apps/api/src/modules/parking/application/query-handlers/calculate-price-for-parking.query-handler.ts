import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CalculatePriceForParkingQuery } from '../queries/calculate-price-for-parking.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AvailabilityFacade } from 'src/modules/availability/application/availability.facade';

export type CalculatePriceForParkingQueryResult = {
  parkingSpotId: string;
  pricePerDay: number;
  pricePerDayPLN: number;
  totalPrice: number;
  totalPricePLN: number;
};

@QueryHandler(CalculatePriceForParkingQuery)
export class CalculatePriceForParkingQueryHandler implements IQueryHandler<
  CalculatePriceForParkingQuery,
  CalculatePriceForParkingQueryResult | null
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly availabilityFacade: AvailabilityFacade,
  ) {}

  async execute(
    query: CalculatePriceForParkingQuery,
  ): Promise<CalculatePriceForParkingQueryResult | null> {
    const { parkingId, days } = query;

    const parkingSpots = await this.prismaService.parkingSpotRead.findMany({
      where: {
        active: true,
        parkingId,
      },
      orderBy: {
        price: 'asc',
      },
    });

    const availabilityChecks = await this.availabilityFacade.areAvailable(
      parkingSpots.map((parkingSpot) => parkingSpot.parkingSpotId),
    );

    const availabilityMap = new Map<string, boolean>(
      availabilityChecks.map((availabilityCheck) => [
        availabilityCheck.parkingSpotId,
        availabilityCheck.available,
      ]),
    );

    let availableParkingSpot: (typeof parkingSpots)[number] | null = null;

    for (const parkingSpot of parkingSpots) {
      if (availabilityMap.get(parkingSpot.parkingSpotId)) {
        availableParkingSpot = parkingSpot;
        break;
      }
    }

    if (!availableParkingSpot) return null;

    return {
      parkingSpotId: availableParkingSpot.parkingSpotId,
      pricePerDay: availableParkingSpot.price,
      pricePerDayPLN: availableParkingSpot.pricePLN,
      totalPrice: days * availableParkingSpot.price,
      totalPricePLN: days * availableParkingSpot.pricePLN,
    };
  }
}
