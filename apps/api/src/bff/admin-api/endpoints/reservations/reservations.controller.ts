import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/bff/admin-api/auth/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetReservationsListQueryParamsDto } from './dto/get-reservations-list-query-params.dto';
import { GetAdminReservationsListHandler } from './handlers/get-admin-reservations-list.handler';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('admin-auth')
@ApiTags('Admin - Reservations')
@Controller('admin/reservations')
export class ReservationsController {
  constructor(
    private readonly getAdminReservationsListHandler: GetAdminReservationsListHandler,
  ) {}

  @ApiOperation({
    summary: 'Get a list of reservations',
  })
  @ApiOkResponse({
    description: 'The list of reservations has been successfully retrieved.',
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
                description: 'The ID of the reservation',
              },
              registrationNumber: {
                type: 'string',
                description: 'The registration number of the vehicle',
              },
              status: {
                type: 'string',
                description: 'The status of the reservation',
                enum: ['CREATED', 'PAID', 'CANCELLED', 'COMPLETED'],
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description:
                  'The date and time when the reservation was created',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description:
                  'The date and time when the reservation was last updated',
              },
              userId: {
                type: 'object',
                description: 'The user object associated with the reservation',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                  },
                  name: {
                    type: 'string',
                  },
                  provider: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        total: {
          type: 'number',
          format: 'int32',
        },
        currentPage: {
          type: 'number',
          format: 'int32',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Error occurred while fetching reservations list due to validation errors.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access to reservations list.',
  })
  @Get()
  async getReservationsList(
    @Query() queryParams: GetReservationsListQueryParamsDto,
  ) {
    return await this.getAdminReservationsListHandler.handle(queryParams);
  }
}
