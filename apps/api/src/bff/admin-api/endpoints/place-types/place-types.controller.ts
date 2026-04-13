import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { CreatePlaceTypeDto } from './dto/create-place-type.dto';
import { UpdatePlaceTypeDto } from './dto/update-place-type.dto';
import { DeletePlaceTypeQueryParamsDto } from './dto/delete-place-type-query-params.dto';
import { GetPlaceTypesListQueryParamsDto } from './dto/get-place-types-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from '../../constants';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('admin-auth')
@ApiTags('Admin Place Types')
@Controller('admin/place-types')
export class PlaceTypesController {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  @ApiOperation({
    summary: 'Get place types list',
  })
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
          example: DEFAULT_PAGE_SIZE,
        },
        currentPage: {
          type: 'number',
          example: 1,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error retrieving place types list due to validation errors.',
  })
  @Get()
  async getPlaceTypesList(
    @Query() queryParams: GetPlaceTypesListQueryParamsDto,
  ) {
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

  @ApiOperation({
    summary: 'Create a new place type',
  })
  @ApiCreatedResponse({
    description: 'The place type has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the created place type',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error creating place type due to validation errors.',
  })
  @Post()
  async createPlaceType(@Body() dto: CreatePlaceTypeDto) {
    const id = await this.parkingFacade.createPlaceType(dto.name);
    return { id };
  }

  @ApiOperation({
    summary: 'Update an existing place type',
  })
  @ApiOkResponse({
    description: 'The place type has been successfully updated.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error updating place type due to validation errors.',
  })
  @Put(':placeTypeId')
  async updatePlaceType(
    @Body() dto: UpdatePlaceTypeDto,
    @Param('placeTypeId', new ParseUUIDPipe()) placeTypeId: string,
  ) {
    const id = await this.parkingFacade.updatePlaceType(
      placeTypeId,
      dto.name,
      dto.version,
    );
    return { id };
  }

  @ApiOperation({
    summary: 'Delete an existing place type',
  })
  @ApiOkResponse({
    description: 'The place type has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error deleting place type due to validation errors.',
  })
  @Delete(':placeTypeId')
  async deletePlaceType(
    @Param('placeTypeId', new ParseUUIDPipe()) placeTypeId: string,
    @Query() queryParams: DeletePlaceTypeQueryParamsDto,
  ) {
    const id = await this.parkingFacade.deletePlaceType(
      placeTypeId,
      queryParams.version,
    );
    return { id };
  }
}
