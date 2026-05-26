import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { UpdateParkingDto } from '../dto/update-parking.dto';

@Injectable()
export class UpdateAdminParkingHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(parkingId: string, dto: UpdateParkingDto) {
    const id = await this.parkingFacade.updateParking(
      parkingId,
      dto.name,
      dto.address,
      dto.longitude,
      dto.latitude,
      dto.assetIds,
      dto.parkingFeatureIds,
      dto.parkingAddonIds,
      dto.description,
      dto?.statute ?? '',
      dto.version,
      dto.placeId,
      dto.organizationId,
    );
    return { id };
  }
}
