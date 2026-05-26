import { ForbiddenException, Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { CreateParkingSpotDto } from '../dto/create-parking-spot.dto';
import type { RequestUser } from 'src/bff/manager-api/auth/types';

@Injectable()
export class AddParkingSpotHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(dto: CreateParkingSpotDto, managerUser: RequestUser) {
    const isRootMap = new Map<string, boolean>(
      managerUser.organizations.map((org) => [org.organizationId, org.isRoot]),
    );

    const parking = await this.parkingFacade.getParkingById(dto.parkingId);

    // check if a user belongs to the organization
    if (
      !managerUser.organizations.some(
        (org) => org.organizationId === parking.organizationId,
      )
    ) {
      throw new ForbiddenException('Access is forbidden for this parking.');
    }

    // check if user has permission to add parking spot
    if (!isRootMap.get(parking.organizationId)) {
      throw new ForbiddenException('Access is forbidden for this operation.');
    }

    const id = await this.parkingFacade.createParkingSpot(
      parking.id,
      dto.price * 100,
      dto.parkingFeatureIds,
      parking.organizationId,
    );

    return { id };
  }
}
