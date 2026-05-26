import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateParkingSpotDto } from './dto/create-parking-spot.dto';
import { CurrentManagerUser } from '../../auth/decorators/current-manager-user.decorator';
import type { RequestUser } from '../../auth/types';
import { AddParkingSpotHandler } from 'src/bff/manager-api/endpoints/parking-spots/handlers/add-parking-spot.handler';

@ApiBearerAuth('manager-auth')
@Controller('manager/parking-spots')
@ApiTags('Parking Spots')
@UseGuards(JwtAuthGuard)
export class ParkingSpotsController {
  constructor(private readonly addParkingSpotHandler: AddParkingSpotHandler) {}

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
}
