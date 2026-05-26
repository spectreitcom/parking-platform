import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetParkingSpotsQueryParamsDto } from './dto/get-parking-spots-query-params.dto';
import { GetParkingSpotsHandler } from './handlers/get-parking-spots.handler';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('admin-auth')
@ApiTags('Parking Spots')
@Controller('admin/parking-spots')
export class ParkingSpotsController {
  constructor(
    private readonly getParkingSpotsHandler: GetParkingSpotsHandler,
  ) {}

  @ApiOperation({ summary: 'Get parking spots by parkingId' })
  @ApiOkResponse({
    description: 'The parking spots have been successfully retrieved.',
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
                description: 'The ID of the parking spot',
              },
              price: {
                type: 'number',
                description: 'The price of the parking spot in PLN',
                example: 100.0,
              },
              active: {
                type: 'boolean',
                description: 'Indicates if the parking spot is active',
              },
              version: {
                type: 'number',
                description: 'The version of the parking spot',
              },
              parkingSpotFeatures: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'The ID of the parking spot feature',
                      format: 'uuid',
                    },
                    name: {
                      type: 'string',
                      description: 'The name of the parking spot feature',
                    },
                  },
                },
              },
            },
          },
        },
        total: {
          type: 'number',
          description: 'Total number of parking spots retrieved',
        },
        currentPage: {
          type: 'number',
          description: 'Current page number',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters provided.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  @Get()
  async getParkingSpots(@Query() queryParams: GetParkingSpotsQueryParamsDto) {
    return await this.getParkingSpotsHandler.handle(queryParams);
  }
}
