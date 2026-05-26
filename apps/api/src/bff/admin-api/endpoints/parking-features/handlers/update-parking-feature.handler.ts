import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { UpdateParkingFeatureDto } from '../dto/update-parking-feature.dto';

@Injectable()
export class UpdateParkingFeatureHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(parkingFeatureId: string, dto: UpdateParkingFeatureDto) {
    const id = await this.parkingFacade.updateParkingFeature(
      parkingFeatureId,
      dto.name,
      dto.levels,
      dto.version,
    );
    return { id };
  }
}
