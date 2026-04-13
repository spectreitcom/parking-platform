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
import { CreateParkingAddonDto } from './dto/create-parking-addon.dto';
import { UpdateParkingAddonDto } from './dto/update-parking-addon.dto';
import { DeleteParkingAddonQueryParamsDto } from './dto/delete-parking-addon-query-params.dto';
import { GetAddonsListQueryParamsDto } from './dto/get-addons-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from '../../constants';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Parking Addons')
@Controller('admin/parking-addons')
export class ParkingAddonsController {
  constructor(private readonly parkingFacade: ParkingFacade) {}

  @ApiOperation({
    summary: 'Get parking addons list',
  })
  @ApiOkResponse({
    description: 'The parking addons list has been successfully retrieved.',
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
                description: 'The ID of the parking addon',
                format: 'uuid',
              },
              code: {
                type: 'string',
                example: 'addon_code',
              },
              name: {
                type: 'string',
                example: 'Addon Name',
              },
              priceInPln: {
                type: 'number',
                example: 100,
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
    description:
      'Error retrieving parking addons list due to validation errors.',
  })
  @Get()
  async getAddonsList(@Query() queryParams: GetAddonsListQueryParamsDto) {
    const data = await this.parkingFacade.getParkingAddonListForAdmin(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );

    const total = await this.parkingFacade.getParkingAddonListForAdminTotal(
      queryParams.search,
    );

    return {
      data,
      total,
      currentPage: queryParams.page ?? 1,
    };
  }

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
