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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateParkingFeatureDto } from './dto/create-parking-feature.dto';
import { UpdateParkingFeatureDto } from './dto/update-parking-feature.dto';
import { DeleteParkingFeatureQueryParamsDto } from './dto/delete-parking-feature-query-params.dto';
import { GetParkingFeaturesListQueryParamsDto } from './dto/get-parking-features-list-query-params.dto';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';
import { GetParkingFeaturesListHandler } from './handlers/get-parking-features-list.handler';
import { GetParkingFeatureByIdHandler } from './handlers/get-parking-feature-by-id.handler';
import { CreateParkingFeatureHandler } from './handlers/create-parking-feature.handler';
import { UpdateParkingFeatureHandler } from './handlers/update-parking-feature.handler';
import { DeleteParkingFeatureHandler } from './handlers/delete-parking-feature.handler';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('admin-auth')
@ApiTags('Admin Parking Features')
@Controller('admin/parking-features')
export class ParkingFeaturesController {
  constructor(
    private readonly getParkingFeaturesListHandler: GetParkingFeaturesListHandler,
    private readonly getParkingFeatureByIdHandler: GetParkingFeatureByIdHandler,
    private readonly createParkingFeatureHandler: CreateParkingFeatureHandler,
    private readonly updateParkingFeatureHandler: UpdateParkingFeatureHandler,
    private readonly deleteParkingFeatureHandler: DeleteParkingFeatureHandler,
  ) {}

  @ApiOperation({
    summary: 'Get parking features list',
  })
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
                description: 'The ID of the parking feature',
                format: 'uuid',
              },
              name: {
                type: 'string',
              },
              levels: {
                type: 'array',
                items: {
                  type: 'string',
                },
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
    description:
      'Error retrieving parking features list due to validation errors.',
  })
  @Get()
  async getParkingFeaturesList(
    @Query() queryParams: GetParkingFeaturesListQueryParamsDto,
  ) {
    return await this.getParkingFeaturesListHandler.handle(queryParams);
  }

  @ApiOperation({
    summary: 'Get parking feature by ID',
  })
  @ApiOkResponse({
    description: 'The parking feature has been successfully retrieved.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the parking feature',
          format: 'uuid',
        },
        name: {
          type: 'string',
        },
        levels: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        version: {
          type: 'number',
          example: 1,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'Parking feature not found',
  })
  @ApiBadRequestResponse({
    description: 'Validation errors',
  })
  @Get(':parkingFeatureId')
  async getParkingFeatureById(
    @Param('parkingFeatureId', new ParseUUIDPipe()) parkingFeatureId: string,
  ) {
    return await this.getParkingFeatureByIdHandler.handle(parkingFeatureId);
  }

  @ApiOperation({
    summary: 'Create a new parking feature',
  })
  @ApiCreatedResponse({
    description: 'The parking feature has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the created parking feature',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error creating parking feature due to validation errors.',
  })
  @Post()
  async createParkingFeature(@Body() dto: CreateParkingFeatureDto) {
    return await this.createParkingFeatureHandler.handle(dto);
  }

  @ApiOperation({
    summary: 'Update an existing parking feature',
  })
  @ApiOkResponse({
    description: 'The parking feature has been successfully updated.',
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
    description: 'Error updating parking feature due to validation errors.',
  })
  @Put(':parkingFeatureId')
  async updateParkingFeature(
    @Body() dto: UpdateParkingFeatureDto,
    @Param('parkingFeatureId', new ParseUUIDPipe()) parkingFeatureId: string,
  ) {
    return await this.updateParkingFeatureHandler.handle(parkingFeatureId, dto);
  }

  @ApiOperation({
    summary: 'Delete an existing parking feature',
  })
  @ApiOkResponse({
    description: 'The parking feature has been successfully deleted.',
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
    description: 'Error deleting parking feature due to validation errors.',
  })
  @Delete(':parkingFeatureId')
  async deleteParkingFeature(
    @Param('parkingFeatureId', new ParseUUIDPipe()) parkingFeatureId: string,
    @Query() queryParams: DeleteParkingFeatureQueryParamsDto,
  ) {
    return await this.deleteParkingFeatureHandler.handle(
      parkingFeatureId,
      queryParams,
    );
  }
}
