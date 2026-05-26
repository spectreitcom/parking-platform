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
import { CreateParkingDto } from './dto/create-parking.dto';
import { GetParkingListQueryParamsDto } from './dto/get-parking-list-query-params.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { ActivateParkingDto } from './dto/activate-parking.dto';
import { DeactivateParkingDto } from './dto/deactivate-parking.dto';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';
import { GetAdminParkingByIdHandler } from './handlers/get-admin-parking-by-id.handler';
import { GetAdminParkingListHandler } from './handlers/get-admin-parking-list.handler';
import { CreateAdminParkingHandler } from './handlers/create-admin-parking.handler';
import { UpdateAdminParkingHandler } from './handlers/update-admin-parking.handler';
import { ActivateAdminParkingHandler } from './handlers/activate-admin-parking.handler';
import { DeactivateAdminParkingHandler } from './handlers/deactivate-admin-parking.handler';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Parkings')
@Controller('admin/parkings')
export class ParkingsController {
  constructor(
    private readonly getAdminParkingByIdHandler: GetAdminParkingByIdHandler,
    private readonly getAdminParkingListHandler: GetAdminParkingListHandler,
    private readonly createAdminParkingHandler: CreateAdminParkingHandler,
    private readonly updateAdminParkingHandler: UpdateAdminParkingHandler,
    private readonly activateAdminParkingHandler: ActivateAdminParkingHandler,
    private readonly deactivateAdminParkingHandler: DeactivateAdminParkingHandler,
  ) {}

  @ApiOperation({ summary: 'Get a parking by ID' })
  @ApiOkResponse({
    description: 'Returns a parking object with organization and place details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        address: { type: 'string' },
        active: { type: 'boolean' },
        longitude: { type: 'number', format: 'float' },
        latitude: { type: 'number', format: 'float' },
        statute: { type: 'string' },
        description: { type: 'string' },
        assetIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
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
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get(':parkingId')
  async getParkingById(
    @Param('parkingId', new ParseUUIDPipe()) parkingId: string,
  ) {
    return await this.getAdminParkingByIdHandler.handle(parkingId);
  }

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
    return await this.getAdminParkingListHandler.handle(queryParams);
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
    return await this.createAdminParkingHandler.handle(createParkingDto);
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
    return await this.updateAdminParkingHandler.handle(parkingId, dto);
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
    return await this.activateAdminParkingHandler.handle(parkingId, dto);
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
    return await this.deactivateAdminParkingHandler.handle(parkingId, dto);
  }
}
