import {
  Controller,
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
import { GetParkingFeaturesListQueryParamsDto } from './dto/get-parkings-list-query-params.dto';
import { CurrentManagerUser } from '../../auth/decorators/current-manager-user.decorator';
import type { RequestUser } from '../../auth/types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetParkingsListHandler } from './handlers/get-parkings-list.handler';
import { GetParkingDetailsHandler } from './handlers/get-parking-details.handler';

@ApiBearerAuth('manager-auth')
@Controller('manager/parkings')
@ApiTags('Parkings')
@UseGuards(JwtAuthGuard)
export class ParkingsController {
  constructor(
    private readonly getParkingsListHandler: GetParkingsListHandler,
    private readonly getParkingDetailsHandler: GetParkingDetailsHandler,
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
  @Get()
  async getParkingsList(
    @Query() queryParams: GetParkingFeaturesListQueryParamsDto,
    @CurrentManagerUser() managerUser: RequestUser,
  ) {
    return await this.getParkingsListHandler.handle(queryParams, managerUser);
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
  @Get(':parkingId/details')
  async getParkingDetails(
    @Param('parkingId', new ParseUUIDPipe()) parkingId: string,
    @CurrentManagerUser() managerUser: RequestUser,
  ) {
    return await this.getParkingDetailsHandler.handle(parkingId, managerUser);
  }
}
