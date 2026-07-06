import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { GetPlacesQueryParamsDto } from './dto/get-places-query-params.dto';
import { MAX_PAGE_SIZE } from 'src/shared/constants';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  @ApiOperation({
    summary: 'Get a list of places',
  })
  @ApiOkResponse({
    description: 'The list of places has been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              placeId: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              latitude: { type: 'number', format: 'float' },
              longitude: { type: 'number', format: 'float' },
              placeTypeId: { type: 'string', format: 'uuid' },
              placeTypeName: { type: 'string' },
              address: { type: 'string' },
              active: { type: 'boolean' },
              version: { type: 'integer', example: 1, format: 'int32' },
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
    description: 'Validation errors',
  })
  @Get()
  async getPlaces(@Query() queryParams: GetPlacesQueryParamsDto) {
    const data = await this.parkingFacade.getPlaces(
      queryParams?.page ?? 1,
      queryParams?.limit ?? MAX_PAGE_SIZE,
      queryParams.placeTypeId,
      queryParams.search,
    );

    const total = await this.parkingFacade.getPlacesTotal(
      queryParams.placeTypeId,
      queryParams.search,
    );

    return {
      data,
      total,
      currentPage: queryParams?.page ?? 1,
    };
  }
}
