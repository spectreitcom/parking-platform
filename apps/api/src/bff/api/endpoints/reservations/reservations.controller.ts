import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ReservationFacade } from 'src/modules/reservation/application/reservation.facade';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('auth')
@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationFacade: ReservationFacade) {}

  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiCreatedResponse({
    description: 'The reservation has been successfully created.',
    type: String,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Post()
  async createReservation(
    @CurrentUserId() userId: string,
    @Body() dto: CreateReservationDto,
  ): Promise<string> {
    return await this.reservationFacade.createReservation(
      dto.cartId,
      userId,
      dto.parkingSpotId,
      dto.startDate,
      dto.endDate,
      dto.registrationNumber,
      dto.lines,
      dto.addons,
    );
  }

  @ApiOperation({ summary: 'Update a reservation' })
  @ApiOkResponse({
    description: 'The reservation has been successfully updated.',
    type: String,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Put(':reservationId')
  async updateReservation(
    @Param('reservationId') reservationId: string,
    @CurrentUserId() userId: string,
    @Body() dto: UpdateReservationDto,
  ): Promise<string> {
    return await this.reservationFacade.updateReservation(
      reservationId,
      userId,
      dto.version,
      dto.registrationNumber,
    );
  }

  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiOkResponse({
    description: 'The reservation has been successfully cancelled.',
    type: String,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Post(':reservationId/cancel')
  async cancelReservation(
    @Param('reservationId') reservationId: string,
    @CurrentUserId() userId: string,
    @Body() dto: CancelReservationDto,
  ): Promise<string> {
    return await this.reservationFacade.cancelReservation(
      reservationId,
      userId,
      dto.version,
    );
  }
}
