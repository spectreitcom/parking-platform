import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetParkingReservationsHandler } from './handlers/get-parking-reservations.handler';
import { GetParkingReservationsQueryParamsDto } from './dto/get-parking-reservations-query-params.dto';
import { CurrentManagerUser } from '../../auth/decorators/current-manager-user.decorator';
import type { RequestUser } from '../../auth/types';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Reservations')
@ApiBearerAuth('manager-auth')
@UseGuards(JwtAuthGuard)
@Controller('manager/reservations')
export class ReservationsController {
  constructor(
    private readonly getParkingReservationsHandler: GetParkingReservationsHandler,
  ) {}

  @ApiOperation({ summary: 'Get parking reservations' })
  @ApiOkResponse({
    description: 'Returns a paginated list of reservations for a parking',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              reservationId: { type: 'string', format: 'uuid' },
              cartId: { type: 'string', format: 'uuid' },
              parkingSpotId: { type: 'string', format: 'uuid' },
              parkingId: { type: 'string', format: 'uuid' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                },
              },
              arrival: { type: 'number' },
              departure: { type: 'number' },
              lines: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    price: { type: 'number' },
                  },
                },
              },
              total: { type: 'number' },
              status: { type: 'string' },
              registrationNumber: { type: 'string' },
              version: { type: 'number' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
        currentPage: { type: 'number' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error retrieving reservations list due to validation errors.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Parking not found' })
  @Get()
  async getParkingReservations(
    @Query() queryParams: GetParkingReservationsQueryParamsDto,
    @CurrentManagerUser() managerUser: RequestUser,
  ) {
    return await this.getParkingReservationsHandler.handle(
      queryParams,
      managerUser,
    );
  }
}
