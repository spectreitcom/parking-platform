import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';
import { GetPlaceTypesListQueryParamsDto } from './dto/get-place-types-list-query-params.dto';

@ApiTags('Place Types')
@Controller('place-types')
export class PlaceTypesController {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  @ApiOperation({ summary: 'Get all place types' })
  @ApiOkResponse({
    description: 'The place types list has been successfully retrieved.',
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
                description: 'The ID of the place type',
                format: 'uuid',
                example: '7026df16-1604-4531-b06f-b1b703666d92',
              },
              name: {
                type: 'string',
                example: 'Outdoor',
              },
              version: {
                type: 'number',
                example: 1,
              },
            },
          },
        },
        total: {
          type: 'number',
          description: 'The total number of items',
          example: 1,
        },
        currentPage: {
          type: 'number',
          description: 'The current page number',
          example: 1,
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @Get()
  async findAll(@Query() queryParams: GetPlaceTypesListQueryParamsDto) {
    const data = await this.parkingFacade.getPlaceTypeList(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );

    const total = await this.parkingFacade.getPlaceTypeListTotal(
      queryParams.search,
    );

    return {
      data,
      total,
      currentPage: queryParams.page ?? 1,
    };
  }
}
