import { ForbiddenException, Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { GetParkingSpotsQueryParamsDto } from '../dto/get-parking-spots-query-params.dto';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';
import { RequestUser } from '../../../auth/types';

@Injectable()
export class GetParkingSpotsHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(
    queryParams: GetParkingSpotsQueryParamsDto,
    managerUser: RequestUser,
  ) {
    const parking = await this.parkingFacade.getParkingById(
      queryParams.parkingId,
    );

    if (
      !managerUser.organizations.some(
        (org) => org.organizationId === parking.organizationId,
      )
    ) {
      throw new ForbiddenException(
        'User is not authorized to access this parking',
      );
    }

    const parkingSpots = await this.parkingFacade.getParkingSpotsByParkingId(
      queryParams.parkingId,
      queryParams?.page ?? 1,
      queryParams?.limit ?? DEFAULT_PAGE_SIZE,
    );

    const parkingFeatures = await this.parkingFacade.getParkingFeatureByIds(
      parkingSpots.flatMap((spot) => spot.parkingSpotFeatureIds),
    );

    const total = await this.parkingFacade.getParkingSpotsByParkingIdTotal(
      queryParams.parkingId,
    );

    const data: (Omit<
      (typeof parkingSpots)[number],
      'pricePLN' | 'parkingSpotFeatureIds' | 'organizationId' | 'parkingId'
    > & {
      price: number;
      parkingSpotFeatures: {
        id: string;
        name: string;
      }[];
    })[] = [];

    for (const parkingSpot of parkingSpots) {
      const { pricePLN } = parkingSpot;

      const parkingSpotFeatures = parkingFeatures.filter((feature) =>
        parkingSpot.parkingSpotFeatureIds.includes(feature.id),
      );

      data.push({
        id: parkingSpot.id,
        active: parkingSpot.active,
        version: parkingSpot.version,
        price: pricePLN,
        parkingSpotFeatures,
      });
    }

    return {
      data,
      total,
      currentPage: queryParams?.page ?? 1,
    };
  }
}
