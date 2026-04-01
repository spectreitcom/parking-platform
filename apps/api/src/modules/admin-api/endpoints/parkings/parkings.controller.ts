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
import { CreateParkingDto } from './dto/create-parking.dto';
import { GetParkingListQueryParamsDto } from './dto/get-parking-list-query-params.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { ActivateParkingDto } from './dto/activate-parking.dto';
import { DeactivateParkingDto } from './dto/deactivate-parking.dto';
import { DEFAULT_PAGE_SIZE } from 'src/modules/admin-api/constants';

@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Parkings')
@Controller('admin/parkings')
export class ParkingsController {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  @ApiOperation({
    summary: 'Get a list of parkings',
  })
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
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              address: { type: 'string' },
              active: { type: 'boolean' },
              spotsNumber: { type: 'number' },
              organization: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                },
              },
              place: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                },
              },
              version: { type: 'number', format: 'int32', example: 1 },
              distance: { type: 'number', format: 'float', example: 10.5 },
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
  async getParkingList(@Query() queryParams: GetParkingListQueryParamsDto) {
    const data = await this.parkingFacade.getParkingListForAdmin(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );
    const total = await this.parkingFacade.getParkingListForAdminTotal(
      queryParams.search,
    );

    return { data, total, currentPage: queryParams.page ?? 1 };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new parking' })
  @ApiCreatedResponse({
    description: 'The parking has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the created parking',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  async createParking(@Body() createParkingDto: CreateParkingDto) {
    const id = await this.parkingFacade.createParking(
      createParkingDto.organizationId,
      createParkingDto.name,
      createParkingDto.address,
      createParkingDto.longitude,
      createParkingDto.latitude,
      createParkingDto.placeId,
    );
    return { id };
  }

  @ApiOperation({
    summary: 'Update an existing parking',
  })
  @ApiOkResponse({
    description: 'The parking has been successfully updated.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the updated parking',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Parking not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @Put(':parkingId')
  async updateParking(
    @Param('parkingId', new ParseUUIDPipe()) parkingId: string,
    @Body() dto: UpdateParkingDto,
  ) {
    const id = await this.parkingFacade.updateParking(
      parkingId,
      dto.name,
      dto.address,
      dto.longitude,
      dto.latitude,
      dto.assetIds,
      dto.parkingFeatureIds,
      dto.parkingAddonIds,
      dto.description,
      dto?.statute ?? '',
      dto.version,
    );
    return { id };
  }

  @ApiOperation({
    summary: 'Activate an existing parking',
  })
  @ApiOkResponse({
    description: 'The parking has been successfully activated.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the activated parking',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Parking not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @Post(':parkingId/activate')
  @HttpCode(HttpStatus.OK)
  async activateParking(
    @Param('parkingId', new ParseUUIDPipe()) parkingId: string,
    @Body() dto: ActivateParkingDto,
  ) {
    const id = await this.parkingFacade.activateParking(parkingId, dto.version);
    return { id };
  }

  @ApiOperation({
    summary: 'Deactivate an existing parking',
  })
  @ApiOkResponse({
    description: 'The parking has been successfully deactivated.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the deactivated parking',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Parking not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @Post(':parkingId/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateParking(
    @Param('parkingId', new ParseUUIDPipe()) parkingId: string,
    @Body() dto: DeactivateParkingDto,
  ) {
    const id = await this.parkingFacade.deactivateParking(
      parkingId,
      dto.version,
    );
    return { id };
  }
}
