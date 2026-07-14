import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { GetPaymentByIdQuery } from '../queries/get-payment-by-id.query';
import { PaymentReadModel } from './read-models/payment.read-model';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetPaymentByIdQuery)
export class GetPaymentByIdQueryHandler implements IQueryHandler<
  GetPaymentByIdQuery,
  PaymentReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetPaymentByIdQuery): Promise<PaymentReadModel> {
    const payment = await this.prismaService.payment.findUnique({
      where: {
        id: query.paymentId,
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
