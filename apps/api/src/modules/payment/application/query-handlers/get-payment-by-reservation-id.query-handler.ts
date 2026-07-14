import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { GetPaymentByReservationIdQuery } from '../queries/get-payment-by-reservation-id.query';
import { PaymentReadModel } from './read-models/payment.read-model';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetPaymentByReservationIdQuery)
export class GetPaymentByReservationIdQueryHandler implements IQueryHandler<
  GetPaymentByReservationIdQuery,
  PaymentReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetPaymentByReservationIdQuery,
  ): Promise<PaymentReadModel> {
    const payment = await this.prismaService.payment.findUnique({
      where: {
        reservationId: query.reservationId,
      },
    });

    if (!payment) {
      throw new AppError('ENTITY_NOT_FOUND', 'Payment not found');
    }

    return new PaymentReadModel(
      payment.id,
      payment.reservationId,
      payment.userId,
      payment.amount,
      payment.createdAt,
      payment.paidAt,
    );
  }
}
