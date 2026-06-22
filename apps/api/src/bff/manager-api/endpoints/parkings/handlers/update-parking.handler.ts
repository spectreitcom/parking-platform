import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import type { RequestUser } from '../../../auth/types';
import { UpdateParkingDto } from 'src/bff/manager-api/endpoints/parkings/dto/update-parking.dto';

@Injectable()
export class UpdateParkingHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(
    parkingId: string,
    dto: UpdateParkingDto,
    managerUser: RequestUser,
  ) {
    const organizationIds = managerUser.organizations.map(
      (org) => org.organizationId,
    );

    const parking = await this.parkingFacade.getParkingById(parkingId);

    if (!parking) {
      throw new NotFoundException('Parking not found');
    }

    if (!organizationIds.includes(parking.organizationId)) {
      throw new ForbiddenException('Access is forbidden');
    }

    const id = await this.parkingFacade.updateParkingForManager(
      parkingId,
      dto.name,
      dto.assetIds,
      dto.parkingFeatureIds,
      dto.parkingAddonIds,
      dto.description,
      dto.statute,
      dto.version,
    );
    return { id };
  }
}
