import { ForbiddenException, Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { GetParkingFeaturesListQueryParamsDto } from '../dto/get-parkings-list-query-params.dto';
import type { RequestUser } from '../../../auth/types';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';
import { PlaceReadReadModel } from 'src/modules/parking/application/query-handlers/read-models/place-read.read-model';

@Injectable()
export class GetParkingsListHandler implements IControllerHandler {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  async handle(
    queryParams: GetParkingFeaturesListQueryParamsDto,
    organizationId: string,
    managerUser: RequestUser,
  ) {
    const organizationIds = managerUser.organizations.map(
      (organization) => organization.organizationId,
    );

    if (!organizationIds.includes(organizationId)) {
      throw new ForbiddenException(
        'You are not authorized to access this resource.',
      );
    }

    const parkings =
      await this.parkingFacade.getParkingsByOrganizationAndOrganizationUserForManager(
        organizationId,
        queryParams.page ?? 1,
        queryParams.limit ?? DEFAULT_PAGE_SIZE,
      );

    const places = await this.parkingFacade.getPlaceByIds(
      parkings.map((parking) => parking.placeId),
    );

    const placesMap = new Map<string, PlaceReadReadModel>(
      places.map((place) => [place.placeId, place]),
    );

    const total =
      await this.parkingFacade.getParkingsByOrganizationAndOrganizationUserForManagerTotal(
        organizationId,
      );

    const data: (Omit<(typeof parkings)[number], 'placeId'> & {
      place: {
        id: string;
        name: string;
        address: string;
      } | null;
    })[] = [];

    for (const parking of parkings) {
      const { placeId, ...rest } = parking;

      const place = placesMap.get(placeId);

      data.push({
        ...rest,
        place: place
          ? {
              id: place.placeId,
              name: place.name,
              address: place.address,
            }
          : null,
      });
    }

    return {
      data,
      total,
      currentPage: queryParams.page ?? 1,
    };
  }
}
