import { ForbiddenException, Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { UpdateParkingSpotDto } from '../dto/update-parking-spot.dto';
import { RequestUser } from '../../../auth/types';

@Injectable()
export class UpdateParkingSpotHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(
    dto: UpdateParkingSpotDto,
    parkingSpotId: string,
    managerUser: RequestUser,
  ) {
    const isRootMap = new Map<string, boolean>(
      managerUser.organizations.map((org) => [org.organizationId, org.isRoot]),
    );

    const parkingSpot =
      await this.parkingFacade.getParkingSpotById(parkingSpotId);

    // only root of the org can update parking spot
    if (!isRootMap.get(parkingSpot.organizationId)) {
      throw new ForbiddenException(
        'You are not authorized to update this parking spot',
      );
    }

    const id = await this.parkingFacade.updateParkingSpot(
      parkingSpotId,
      Math.round(dto.price * 100),
      dto.parkingFeatureIds,
      dto.version,
      parkingSpot.organizationId,
    );

    return { id };
  }
}
