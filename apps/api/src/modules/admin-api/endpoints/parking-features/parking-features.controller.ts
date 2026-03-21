import {
  Body,
  Controller,
  Delete,
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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ParkingFacade } from '../../../parking/application/parking.facade';
import { CreateParkingFeatureDto } from './dto/create-parking-feature.dto';
import { UpdateParkingFeatureDto } from './dto/update-parking-feature.dto';
import { DeleteParkingFeatureQueryParamsDto } from './dto/delete-parking-feature-query-params.dto';

@ApiBearerAuth('admin-auth')
@ApiTags('Admin Parking Features')
@Controller('admin/parking-features')
export class ParkingFeaturesController {
  constructor(private readonly parkingFacade: ParkingFacade) {}

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
    const id = await this.parkingFacade.createParkingFeature(
      dto.name,
      dto.levels,
    );
    return { id };
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
    const id = await this.parkingFacade.updateParkingFeature(
      parkingFeatureId,
      dto.name,
      dto.levels,
      dto.version,
    );
    return { id };
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
    const id = await this.parkingFacade.deleteParkingFeature(
      parkingFeatureId,
      queryParams.version,
    );
    return { id };
  }
}
