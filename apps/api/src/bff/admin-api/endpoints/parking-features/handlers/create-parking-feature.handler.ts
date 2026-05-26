import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { CreateParkingFeatureDto } from '../dto/create-parking-feature.dto';

@Injectable()
export class CreateParkingFeatureHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(dto: CreateParkingFeatureDto) {
    const id = await this.parkingFacade.createParkingFeature(
      dto.name,
      dto.levels,
    );
    return { id };
  }
}
