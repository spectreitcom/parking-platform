import { ForbiddenException, Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';
import type { RequestUser } from '../../../auth/types';

@Injectable()
export class GetParkingDetailsHandler implements IControllerHandler {
  constructor(
    private readonly parkingFacade: ParkingFacade,
    private readonly organizationFacade: OrganizationFacade,
  ) {}

  async handle(parkingId: string, managerUser: RequestUser) {
    const isRootMap = new Map<string, boolean>(
      managerUser.organizations.map((org) => [org.organizationId, org.isRoot]),
    );

    const parking = await this.parkingFacade.getParkingById(parkingId);

    const { longitude, latitude, placeId, organizationId, ...rest } = parking;

    if (
      !managerUser.organizations.some(
        (org) => org.organizationId === organizationId,
      )
    ) {
      throw new ForbiddenException(
        'Access to the parking details is forbidden.',
      );
    }

    const organization =
      await this.organizationFacade.getOrganizationByIdForAdmin(organizationId);

    const place = await this.parkingFacade.getPlaceForEditing(placeId);

    const parkingFeatureItems = await this.parkingFacade.getParkingFeatureByIds(
      parking.parkingFeatureIds,
    );

    const parkingAddonItems = await this.parkingFacade.getParkingAddonByIds(
      parking.parkingAddonIds,
    );

    return {
      ...rest,
      coords: { latitude, longitude },
      place: {
        id: place.placeId,
        name: place.name,
        address: place.address,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        address: organization.address,
      },
      parkingFeatures: parkingFeatureItems.map((feature) => ({
        id: feature.id,
        name: feature.name,
      })),
      parkingAddons: parkingAddonItems.map((addon) => ({
        id: addon.id,
        name: addon.name,
      })),
      actions: {
        edit: isRootMap.get(organizationId) ?? false,
        addParkingSpot: isRootMap.get(organizationId) ?? false,
        removeParkingSpot: isRootMap.get(organizationId) ?? false,
      },
    } satisfies Omit<
      typeof parking,
      'longitude' | 'latitude' | 'placeId' | 'organizationId'
    > & {
      coords: {
        latitude: number;
        longitude: number;
      };
      place: {
        id: string;
        name: string;
        address: string;
      };
      organization: {
        id: string;
        name: string;
        address: string;
      };
      parkingFeatures: {
        id: string;
        name: string;
      }[];
      parkingAddons: {
        id: string;
        name: string;
      }[];
      actions: {
        edit: boolean;
        addParkingSpot: boolean;
        removeParkingSpot: boolean;
      };
    };
  }
}
