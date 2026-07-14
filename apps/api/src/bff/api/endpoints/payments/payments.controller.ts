import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MarkReservationAsPaidDto } from './dto/mark-reservation-as-paid.dto';
import { PaymentFacade } from 'src/modules/payment/application/payment.facade';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';

@ApiTags('Payments')
@ApiBearerAuth('auth')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentFacade: PaymentFacade) {}

  @ApiOperation({ summary: 'Mark reservation as paid' })
  @ApiCreatedResponse({
    description: 'Reservation marked as paid successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Post('mark-as-paid')
  async markReservationAsPaid(
    @Body() dto: MarkReservationAsPaidDto,
    @CurrentUserId() userId: string,
  ) {
    const id = await this.paymentFacade.devMakePayment(
      dto.reservationId,
      userId,
    );

    return { id };
  }
}
