import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { RequestUser } from 'src/bff/manager-api/auth/types';
import { ActivateOrDeactivateParkingSpotDto } from '../../dto/activate-or-deactivate-parking-spot.dto';

@Injectable()
export class ActivateAndDeactivateParkingSpotService {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async activate(
    parkingSpotId: string,
    dto: ActivateOrDeactivateParkingSpotDto,
    managerUser: RequestUser,
  ) {
    const parkingSpot = await this.beforeOperation(parkingSpotId, managerUser);

    const id = await this.parkingFacade.activateParkingSpot(
      parkingSpotId,
      dto.version,
      parkingSpot.organizationId,
    );

    return { id };
  }

  async deactivate(
    parkingSpotId: string,
    dto: ActivateOrDeactivateParkingSpotDto,
    managerUser: RequestUser,
  ) {
    const parkingSpot = await this.beforeOperation(parkingSpotId, managerUser);

    const id = await this.parkingFacade.deactivateParkingSpot(
      parkingSpotId,
      dto.version,
      parkingSpot.organizationId,
    );

    return { id };
  }

  private async beforeOperation(
    parkingSpotId: string,
    managerUser: RequestUser,
  ) {
    const isRootMap = new Map<string, boolean>(
      managerUser.organizations.map((org) => [org.organizationId, org.isRoot]),
    );

    const parkingSpot =
      await this.parkingFacade.getParkingSpotById(parkingSpotId);

    if (!parkingSpot) {
      throw new NotFoundException('Parking spot not found');
    }

    if (!isRootMap.get(parkingSpot.organizationId)) {
      throw new ForbiddenException('Access is forbidden for this operation.');
    }

    return parkingSpot;
  }
}
