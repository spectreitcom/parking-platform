import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { GetReservationsListQueryParamsDto } from './dto/get-reservations-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';
import { ParkingFacade } from 'src/modules/parking/application/parking.facade';
import { AppError } from 'src/shared/errors';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('auth')
@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationFacade: ReservationFacade,
    private readonly parkingFacade: ParkingFacade,
  ) {}

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
    const parking = await this.parkingFacade.getParkingByParkingSpotId(
      dto.parkingSpotId,
    );

    if (!parking) {
      throw new AppError('VALIDATION_ERROR', 'Parking not found');
    }

    return await this.reservationFacade.createReservation(
      dto.cartId,
      userId,
      parking.id,
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
  @HttpCode(HttpStatus.OK)
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

  @ApiOperation({
    summary: 'Get a list of reservations for a user',
  })
  @ApiOkResponse({
    description: 'Returns a paginated list of reservations for the user',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              registrationNumber: { type: 'string', example: 'ABC123' },
              parkingSpotId: { type: 'string', format: 'uuid' },
              parking: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string', example: 'Parking A' },
                },
              },
              status: {
                type: 'string',
                enum: ['CREATED', 'PAID', 'CANCELLED', 'COMPLETED'],
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              arrivalDate: { type: 'string', format: 'date-time' },
              departureDate: { type: 'string', format: 'date-time' },
              version: { type: 'number', format: 'int32', example: 1 },
              canCancel: { type: 'boolean', example: true },
              canEdit: { type: 'boolean', example: true },
            },
          },
        },
        total: { type: 'number', format: 'int32', example: 20 },
        currentPage: { type: 'number', format: 'int32', example: 1 },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error retrieving reservations list due to validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Get()
  async getReservationsList(
    @CurrentUserId() userId: string,
    @Query() queryParams: GetReservationsListQueryParamsDto,
  ) {
    const reservations = await this.reservationFacade.getUserReservationsList(
      userId,
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );

    const parkings = await this.parkingFacade.getParkingByIds(
      reservations.map((r) => r.parkingId),
    );

    const parkingMap = new Map(parkings.map((p) => [p.id, p]));

    const data: ((typeof reservations)[0] & {
      parking: { id: string; name: string } | null;
    })[] = [];

    for (const reservation of reservations) {
      data.push({
        ...reservation,
        parking: parkingMap.get(reservation.parkingId) ?? null,
      });
    }

    const total = await this.reservationFacade.getUserReservationsListTotal(
      userId,
      queryParams.search,
    );

    return { data, total, currentPage: queryParams.page ?? 1 };
  }
}
