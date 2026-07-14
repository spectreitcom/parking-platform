import { GetPaymentsByReservationIdsQuery } from '../queries/get-payments-by-reservation-ids.query';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaymentReadModel } from './read-models/payment.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetPaymentsByReservationIdsQuery)
export class GetPaymentsByReservationIdsQueryHandler implements IQueryHandler<
  GetPaymentsByReservationIdsQuery,
  PaymentReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetPaymentsByReservationIdsQuery,
  ): Promise<PaymentReadModel[]> {
    const payments = await this.prismaService.payment.findMany({
      where: {
        reservationId: {
          in: query.reservationIds,
        },
      },
    });

    return payments.map(
      (payment) =>
        new PaymentReadModel(
          payment.id,
          payment.reservationId,
          payment.userId,
          payment.amount,
          payment.createdAt,
          payment.paidAt,
        ),
    );
  }
}
