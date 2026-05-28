import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { GetParkingFeaturesListQueryParamsDto } from '../dto/get-parking-features-list-query-params.dto';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

@Injectable()
export class GetParkingFeaturesListHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(queryParams: GetParkingFeaturesListQueryParamsDto) {
    const data = await this.parkingFacade.getParkingFeaturesList(
      queryParams?.page ?? 1,
      queryParams?.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
      queryParams.levels,
    );

    const total = await this.parkingFacade.getParkingFeaturesListTotal(
      queryParams.search,
      queryParams.levels,
    );

    return {
      data,
      total,
      currentPage: queryParams?.page ?? 1,
    };
  }
}
