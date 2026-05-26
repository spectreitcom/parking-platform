import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { DeleteParkingFeatureQueryParamsDto } from '../dto/delete-parking-feature-query-params.dto';

@Injectable()
export class DeleteParkingFeatureHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(
    parkingFeatureId: string,
    queryParams: DeleteParkingFeatureQueryParamsDto,
  ) {
    const id = await this.parkingFacade.deleteParkingFeature(
      parkingFeatureId,
      queryParams.version,
    );
    return { id };
  }
}
