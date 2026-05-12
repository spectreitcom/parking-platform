import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { GetPlacesListQueryParamsDto } from './dto/get-places-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/bff/admin-api/constants';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { ActivatePlaceDto } from './dto/activate-place.dto';
import { DeactivatePlaceDto } from './dto/deactivate-place.dto';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Places')
@Controller('admin/places')
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
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              address: { type: 'string' },
              active: { type: 'boolean' },
              placeTypeName: { type: 'string' },
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
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @Get()
  async getPlacesList(@Query() queryParams: GetPlacesListQueryParamsDto) {
    const data = await this.parkingFacade.getPlacesListForAdmin(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );
    const total = await this.parkingFacade.getPlacesListForAdminTotal(
      queryParams.search,
    );

    return {
      data,
      total,
      currentPage: queryParams.page ?? 1,
    };
  }

  @Get(':placeId')
  @ApiOperation({ summary: 'Get place for editing' })
  @ApiOkResponse({
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
        version: { type: 'number', format: 'int32', example: 1 },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @ApiNotFoundResponse({
    description: 'Place not found',
  })
  async getPlaceForEditing(
    @Param('placeId', new ParseUUIDPipe()) placeId: string,
  ) {
    return await this.parkingFacade.getPlaceForEditing(placeId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new place' })
  @ApiCreatedResponse({
    description: 'The place has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the created place',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  async createPlace(@Body() createPlaceDto: CreatePlaceDto) {
    const id = await this.parkingFacade.createPlace(
      createPlaceDto.name,
      createPlaceDto.latitude,
      createPlaceDto.longitude,
      createPlaceDto.placeTypeId,
      createPlaceDto.address,
    );
    return { id };
  }

  @ApiOperation({
    summary: 'Update an existing place',
  })
  @ApiOkResponse({
    description: 'The place has been successfully updated.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the updated place',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Place not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @Put(':placeId')
  async updatePlace(
    @Param('placeId', new ParseUUIDPipe()) placeId: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ) {
    const id = await this.parkingFacade.updatePlace(
      placeId,
      updatePlaceDto.name,
      updatePlaceDto.latitude,
      updatePlaceDto.longitude,
      updatePlaceDto.placeTypeId,
      updatePlaceDto.address,
      updatePlaceDto.version,
    );
    return { id };
  }

  @ApiOperation({
    summary: 'Activate an existing place',
  })
  @ApiOkResponse({
    description: 'The place has been successfully activated.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the activated place',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Place not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @Post(':placeId/activate')
  @HttpCode(HttpStatus.OK)
  async activatePlace(
    @Param('placeId', new ParseUUIDPipe()) placeId: string,
    @Body() activatePlaceDto: ActivatePlaceDto,
  ) {
    const id = await this.parkingFacade.activatePlace(
      placeId,
      activatePlaceDto.version,
    );
    return { id };
  }

  @ApiOperation({
    summary: 'Deactivate an existing place',
  })
  @ApiOkResponse({
    description: 'The place has been successfully deactivated.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the deactivated place',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Place not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @Post(':placeId/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivatePlace(
    @Param('placeId', new ParseUUIDPipe()) placeId: string,
    @Body() deactivatePlaceDto: DeactivatePlaceDto,
  ) {
    const id = await this.parkingFacade.deactivatePlace(
      placeId,
      deactivatePlaceDto.version,
    );
    return { id };
  }
}
