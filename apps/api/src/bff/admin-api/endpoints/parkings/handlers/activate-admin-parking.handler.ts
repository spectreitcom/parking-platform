import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { ActivateParkingDto } from '../dto/activate-parking.dto';

@Injectable()
export class ActivateAdminParkingHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(parkingId: string, dto: ActivateParkingDto) {
    const id = await this.parkingFacade.activateParking(parkingId, dto.version);
    return { id };
  }
}
