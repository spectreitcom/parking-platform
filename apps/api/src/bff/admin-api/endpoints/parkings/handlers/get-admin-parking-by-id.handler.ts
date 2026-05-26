import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';

@Injectable()
export class GetAdminParkingByIdHandler implements IControllerHandler {
  constructor(
    private readonly parkingFacade: ParkingFacade,
    private readonly organizationFacade: OrganizationFacade,
  ) {}

  async handle(parkingId: string) {
    const parking = await this.parkingFacade.getParkingById(parkingId);

    const {
      organizationId,
      placeId,
      parkingFeatureIds,
      parkingAddonIds,
      ...rest
    } = parking;

    const [parkingFeatures, parkingAddons, organization, place] =
      await Promise.all([
        this.parkingFacade.getParkingFeatureByIds(parkingFeatureIds),
        this.parkingFacade.getParkingAddonByIds(parkingAddonIds),
        this.organizationFacade.getOrganizationByIdForAdmin(organizationId),
        this.parkingFacade.getPlaceForEditing(placeId),
      ]);

    return {
      ...rest,
      organization: {
        id: organization.id,
        name: organization.name,
      },
      place: {
        id: place.placeId,
        name: place.name,
      },
      parkingFeatures: parkingFeatures.map((feature) => ({
        id: feature.id,
        name: feature.name,
      })),
      parkingAddons: parkingAddons.map((addon) => ({
        id: addon.id,
        name: addon.name,
      })),
    } satisfies Omit<
      typeof parking,
      'organizationId' | 'placeId' | 'parkingAddonIds' | 'parkingFeatureIds'
    > & {
      organization: { id: string; name: string };
      place: { id: string; name: string };
      parkingFeatures: { id: string; name: string }[];
      parkingAddons: { id: string; name: string }[];
    };
  }
}
