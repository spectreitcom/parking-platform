import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetParkingFeaturesListQueryParamsDto } from './dto/get-parking-features-list-query-params.dto';
import { GetParkingFeaturesListHandler } from './handlers/get-parking-features-list.handler';

@ApiBearerAuth('manager-auth')
@Controller('manager/parking-features')
@ApiTags('Parking Features')
@UseGuards(JwtAuthGuard)
export class ParkingFeaturesController {
  constructor(
    private readonly getParkingFeaturesListHandler: GetParkingFeaturesListHandler,
  ) {}

  @ApiOperation({ summary: 'Get parking features list' })
  @ApiOkResponse({
    description: 'The parking features list has been successfully retrieved.',
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
                format: 'uuid',
              },
              name: {
                type: 'string',
                example: 'Prysznic',
              },
              levels: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['PARKING', 'PARKING_SPOT'],
                },
              },
              version: {
                type: 'number',
                minimum: 1,
                example: 1,
              },
            },
          },
        },
        total: {
          type: 'number',
        },
        currentPage: {
          type: 'number',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Error retrieving parking features list due to validation errors.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Get()
  async getParkingFeaturesList(
    @Query() queryParams: GetParkingFeaturesListQueryParamsDto,
  ) {
    return await this.getParkingFeaturesListHandler.handle(queryParams);
  }
}
