import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';

@Injectable()
export class GetParkingFeatureByIdHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(parkingFeatureId: string) {
    return await this.parkingFacade.getParkingFeatureById(parkingFeatureId);
  }
}
