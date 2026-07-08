import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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
    summary: 'Get place details',
  })
  @ApiParam({
    name: 'placeId',
    type: 'string',
    format: 'uuid',
    description: 'The unique identifier of the place',
  })
  @ApiOkResponse({
    description: 'The place details have been successfully retrieved.',
    schema: {
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
  })
  @ApiNotFoundResponse({
    description: 'Place not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
  })
  @Get(':placeId')
  async getPlaceDetails(
    @Param('placeId', new ParseUUIDPipe()) placeId: string,
  ) {
    const result = await this.parkingFacade.getPlaceByIds([placeId]);
    if (!result.length || result.length > 1)
      throw new NotFoundException(`Place with id ${placeId} not found`);
    return result[0];
  }

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
