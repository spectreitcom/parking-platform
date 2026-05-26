import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { CreateParkingSpotDto } from './dto/create-parking-spot.dto';
import { CurrentManagerUser } from '../../auth/decorators/current-manager-user.decorator';
import type { RequestUser } from '../../auth/types';

@ApiBearerAuth('manager-auth')
@Controller('manager/parking-spots')
@ApiTags('Parking Spots')
@UseGuards(JwtAuthGuard)
export class ParkingSpotsController {
  constructor(private readonly parkingFacade: ParkingFacade) {}

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
    description: 'Errors due to valiation',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden access to the operation',
  })
  @Post()
  async addParkingSpot(
    @Body() dto: CreateParkingSpotDto,
    @CurrentManagerUser() managerUser: RequestUser,
  ) {
    const isRootMap = new Map<string, boolean>(
      managerUser.organizations.map((org) => [org.organizationId, org.isRoot]),
    );

    const parking = await this.parkingFacade.getParkingById(dto.parkingId);

    // check if a user belongs to the organization
    if (
      !managerUser.organizations.some(
        (org) => org.organizationId === parking.organizationId,
      )
    ) {
      throw new ForbiddenException('Access is forbidden for this parking.');
    }

    // check if user has permission to add parking spot
    if (!isRootMap.get(parking.organizationId)) {
      throw new ForbiddenException('Access is forbidden for this operation.');
    }

    const id = await this.parkingFacade.createParkingSpot(
      parking.id,
      dto.price * 100,
      dto.parkingFeatureIds,
      parking.organizationId,
    );

    return { id };
  }
}
