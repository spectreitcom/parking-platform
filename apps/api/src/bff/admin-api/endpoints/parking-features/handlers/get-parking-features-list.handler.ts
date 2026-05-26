import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { GetParkingFeaturesListQueryParamsDto } from '../dto/get-parking-features-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from '../../../constants';

@Injectable()
export class GetParkingFeaturesListHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(queryParams: GetParkingFeaturesListQueryParamsDto) {
    const data = await this.parkingFacade.getParkingFeatureListForAdmin(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );

    const total = await this.parkingFacade.getParkingFeatureListForAdminTotal(
      queryParams.search,
    );

    return {
      data,
      total,
      currentPage: queryParams.page ?? 1,
    };
  }
}
