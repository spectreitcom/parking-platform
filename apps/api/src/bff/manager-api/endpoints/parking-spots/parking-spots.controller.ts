import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateParkingSpotDto } from './dto/create-parking-spot.dto';
import { CurrentManagerUser } from '../../auth/decorators/current-manager-user.decorator';
import type { RequestUser } from '../../auth/types';
import { AddParkingSpotHandler } from './handlers/add-parking-spot.handler';
import { UpdateParkingSpotHandler } from './handlers/update-parking-spot.handler';
import { UpdateParkingSpotDto } from './dto/update-parking-spot.dto';
import { GetParkingSpotsHandler } from './handlers/get-parking-spots.handler';
import { GetParkingSpotsQueryParamsDto } from './dto/get-parking-spots-query-params.dto';

@ApiBearerAuth('manager-auth')
@Controller('manager/parking-spots')
@ApiTags('Parking Spots')
@UseGuards(JwtAuthGuard)
export class ParkingSpotsController {
  constructor(
    private readonly addParkingSpotHandler: AddParkingSpotHandler,
    private readonly updateParkingSpotHandler: UpdateParkingSpotHandler,
    private readonly getParkingSpotsHandler: GetParkingSpotsHandler,
  ) {}

  @ApiOperation({ summary: 'Get parking spots by parking ID' })
  @ApiOkResponse({
    description: 'List of parking spots',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              active: { type: 'boolean' },
              version: { type: 'number', minimum: 0 },
              price: { type: 'number', minimum: 0 },
              parkingSpotFeatures: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        total: { type: 'number', minimum: 0 },
        currentPage: { type: 'number', minimum: 1 },
      },
    },
  })
  @Get()
  async getParkingSpots(
    @Query() queryParams: GetParkingSpotsQueryParamsDto,
    @CurrentManagerUser() managerUser: RequestUser,
  ) {
    return await this.getParkingSpotsHandler.handle(queryParams, managerUser);
  }

  @ApiOperation({ summary: 'Add a parking spot to a parking' })
  @ApiCreatedResponse({
    description: 'Parking spot added successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Parking not found',
  })
  @ApiBadRequestResponse({
    description: 'Errors due to validation',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden access to the operation',
  })
  @Post()
  async addParkingSpot(
    @Body() dto: CreateParkingSpotDto,
    @CurrentManagerUser() managerUser: RequestUser,
  ) {
    return await this.addParkingSpotHandler.handle(dto, managerUser);
  }

  @ApiOperation({ summary: 'Update a parking spot' })
  @ApiOkResponse({
    description: 'Parking spot updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Parking spot not found',
  })
  @ApiBadRequestResponse({
    description: 'Errors due to validation',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden access to the operation',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to the operation',
  })
  @Put(':parkingSpotId')
  async updateParkingSpot(
    @Param('parkingSpotId', new ParseUUIDPipe()) parkingSpotId: string,
    @Body() dto: UpdateParkingSpotDto,
    @CurrentManagerUser() managerUser: RequestUser,
  ) {
    return await this.updateParkingSpotHandler.handle(
      dto,
      parkingSpotId,
      managerUser,
    );
  }
}
