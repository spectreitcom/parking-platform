import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { GetParkingListQueryParamsDto } from '../dto/get-parking-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/bff/admin-api/constants';

@Injectable()
export class GetAdminParkingListHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(queryParams: GetParkingListQueryParamsDto) {
    const data = await this.parkingFacade.getParkingListForAdmin(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );
    const total = await this.parkingFacade.getParkingListForAdminTotal(
      queryParams.search,
    );

    return { data, total, currentPage: queryParams.page ?? 1 };
  }
}
