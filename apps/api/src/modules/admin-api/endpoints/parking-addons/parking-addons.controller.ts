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
import { CreateParkingAddonDto } from './dto/create-parking-addon.dto';
import { UpdateParkingAddonDto } from './dto/update-parking-addon.dto';
import { DeleteParkingAddonQueryParamsDto } from './dto/delete-parking-addon-query-params.dto';

@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Parking Addons')
@Controller('admin/parking-addons')
export class ParkingAddonsController {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  @ApiOperation({
    summary: 'Create a new parking addon',
  })
  @ApiCreatedResponse({
    description: 'The parking addon has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the created parking addon',
          format: 'uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBadRequestResponse({
    description: 'Error creating parking addon due to validation errors.',
  })
  @Post()
  async createParkingAddon(@Body() dto: CreateParkingAddonDto) {
    const id = await this.parkingFacade.createParkingAddon(
      dto.code,
      dto.name,
      dto.price,
    );
    return { id };
  }

  @ApiOperation({
    summary: 'Update an existing parking addon',
  })
  @ApiOkResponse({
    description: 'The parking addon has been successfully updated.',
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
    description: 'Error updating parking addon due to validation errors.',
  })
  @Put(':parkingAddonId')
  async updateParkingAddon(
    @Body() dto: UpdateParkingAddonDto,
    @Param('parkingAddonId', new ParseUUIDPipe()) parkingAddonId: string,
  ) {
    const id = await this.parkingFacade.updateParkingAddon(
      parkingAddonId,
      dto.name,
      dto.price,
      dto.version,
    );
    return { id };
  }

  @ApiOperation({
    summary: 'Delete an existing parking addon',
  })
  @ApiOkResponse({
    description: 'The parking addon has been successfully deleted.',
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
    description: 'Error deleting parking addon due to validation errors.',
  })
  @Delete(':parkingAddonId')
  async deleteParkingAddon(
    @Param('parkingAddonId', new ParseUUIDPipe()) parkingAddonId: string,
    @Query() queryParams: DeleteParkingAddonQueryParamsDto,
  ) {
    const id = await this.parkingFacade.deleteParkingAddon(
      parkingAddonId,
      queryParams.version,
    );
    return { id };
  }
}
