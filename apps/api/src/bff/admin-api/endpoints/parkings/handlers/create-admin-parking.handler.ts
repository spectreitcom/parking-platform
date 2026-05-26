import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { CreateParkingDto } from '../dto/create-parking.dto';

@Injectable()
export class CreateAdminParkingHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(createParkingDto: CreateParkingDto) {
    const id = await this.parkingFacade.createParking(
      createParkingDto.organizationId,
      createParkingDto.name,
      createParkingDto.address,
      createParkingDto.longitude,
      createParkingDto.latitude,
      createParkingDto.placeId,
    );
    return { id };
  }
}
