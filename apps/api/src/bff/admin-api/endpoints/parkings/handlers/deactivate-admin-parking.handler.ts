import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { DeactivateParkingDto } from '../dto/deactivate-parking.dto';

@Injectable()
export class DeactivateAdminParkingHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(parkingId: string, dto: DeactivateParkingDto) {
    const id = await this.parkingFacade.deactivateParking(
      parkingId,
      dto.version,
    );
    return { id };
  }
}
