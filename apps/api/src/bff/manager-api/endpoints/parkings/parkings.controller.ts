import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { GetParkingFeaturesListQueryParamsDto } from './dto/get-parkings-list-query-params.dto';
import { CurrentManagerUser } from '../../auth/decorators/current-manager-user.decorator';
import type { RequestUser } from '../../auth/types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';
import { PlaceReadReadModel } from 'src/modules/parking/application/query-handlers/read-models/place-read.read-model';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';

@ApiBearerAuth('manager-auth')
@Controller('manager/parkings')
@ApiTags('Parkings')
@UseGuards(JwtAuthGuard)
export class ParkingsController {
  constructor(
    private readonly parkingFacade: ParkingFacade,
    private readonly organizationFacade: OrganizationFacade,
  ) {}

  @ApiOperation({ summary: 'Get list of parkings' })
  @ApiOkResponse({
    description: 'The list of parkings has been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the parking',
              },
              name: {
                type: 'string',
                description: 'The name of the parking',
              },
              active: {
                type: 'boolean',
                description: 'Whether the parking is active or not',
              },
              place: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'The ID of the place',
                  },
                  name: {
                    type: 'string',
                    description: 'The name of the place',
                  },
                  address: {
                    type: 'string',
                    description: 'The address of the place',
                  },
                },
              },
              version: {
                type: 'number',
                description: 'The version of the parking',
                minimum: 1,
              },
            },
          },
        },
        total: {
          type: 'number',
          description: 'The total number of parkings',
        },
        currentPage: {
          type: 'number',
          description: 'The current page of parkings',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error retrieving parkings list due to validation errors.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Get(':organizationId')
  async getParkingsList(
    @Query() queryParams: GetParkingFeaturesListQueryParamsDto,
    @Param('organizationId', new ParseUUIDPipe()) organizationId: string,
    @CurrentManagerUser() managerUser: RequestUser,
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

  @ApiOperation({ summary: 'Get parking details' })
  @ApiOkResponse({
    description: 'The parking details have been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        coords: {
          type: 'object',
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' },
          },
        },
        statute: { type: 'string' },
        description: { type: 'string' },
        organization: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            address: { type: 'string' },
          },
        },
        parkingFeatures: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
        },
        parkingAddons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
        },
        place: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            address: { type: 'string' },
          },
        },
        active: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        version: { type: 'number' },
        assetIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
        },
        actions: {
          type: 'object',
          properties: {
            edit: { type: 'boolean' },
            addParkingSpot: { type: 'boolean' },
            removeParkingSpot: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid organization or parking ID provided.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Access to the parking details is forbidden.',
  })
  @ApiNotFoundResponse({
    description: 'Parking not found.',
  })
  @Get(':organizationId/:parkingId')
  async getParkingDetails(
    @Param('organizationId', new ParseUUIDPipe()) currentOrganizationId: string,
    @Param('parkingId', new ParseUUIDPipe()) parkingId: string,
    @CurrentManagerUser() managerUser: RequestUser,
  ) {
    const isRootMap = new Map<string, boolean>(
      managerUser.organizations.map((org) => [org.organizationId, org.isRoot]),
    );

    const parking = await this.parkingFacade.getParkingById(parkingId);

    const { longitude, latitude, placeId, organizationId, ...rest } = parking;

    if (currentOrganizationId !== organizationId) {
      throw new ForbiddenException(
        'Access to the parking details is forbidden.',
      );
    }

    const place = await this.parkingFacade.getPlaceForEditing(placeId);

    const organization =
      await this.organizationFacade.getOrganizationByIdForAdmin(organizationId);

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
