import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { GetParkingSpotsQueryParamsDto } from '../dto/get-parking-spots-query-params.dto';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

@Injectable()
export class GetParkingSpotsHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(queryParams: GetParkingSpotsQueryParamsDto) {
    const [parkingSpots, total] = await Promise.all([
      this.parkingFacade.getParkingSpotsByParkingId(
        queryParams.parkingId,
        queryParams.page ?? 1,
        queryParams.limit ?? DEFAULT_PAGE_SIZE,
      ),
      this.parkingFacade.getParkingSpotsByParkingIdTotal(queryParams.parkingId),
    ]);

    const parkingSpotFeatures = await this.parkingFacade.getParkingFeatureByIds(
      parkingSpots.flatMap((parkingSpot) => parkingSpot.parkingSpotFeatureIds),
    );

    const parkingSpotFeaturesMap = new Map(
      parkingSpotFeatures.map((parkingSpotFeature) => [
        parkingSpotFeature.id,
        parkingSpotFeature,
      ]),
    );

    const data: (Omit<
      (typeof parkingSpots)[number],
      'parkingSpotFeatureIds' | 'organizationId' | 'parkingId' | 'pricePLN'
    > & {
      parkingSpotFeatures: ({ id: string; name: string } | null)[];
    })[] = [];

    for (const parkingSpot of parkingSpots) {
      const { parkingSpotFeatureIds } = parkingSpot;

      const _parkingSpotFeatures = parkingSpotFeatureIds.map((id) => {
        const parkingSpotFeature = parkingSpotFeaturesMap.get(id);
        if (!parkingSpotFeature) return null;
        return {
          id: parkingSpotFeature.id,
          name: parkingSpotFeature.name,
        };
      });

      data.push({
        id: parkingSpot.id,
        price: parkingSpot.pricePLN,
        active: parkingSpot.active,
        version: parkingSpot.version,
        parkingSpotFeatures: _parkingSpotFeatures,
      });
    }

    return {
      data,
      total,
      currentPage: queryParams.page ?? 1,
    };
  }
}
