import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DevMakePaymentCommand } from './commands/dev-make-payment.command';
import { GetPaymentByIdQuery } from './queries/get-payment-by-id.query';
import { GetPaymentByReservationIdQuery } from './queries/get-payment-by-reservation-id.query';
import { PaymentReadModel } from './query-handlers/read-models/payment.read-model';

@Injectable()
export class PaymentFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async devMakePayment(reservationId: string, userId: string): Promise<string> {
    return this.commandBus.execute(
      new DevMakePaymentCommand(reservationId, userId),
    );
  }

  async getPaymentByReservationId(
    reservationId: string,
  ): Promise<PaymentReadModel> {
    return this.queryBus.execute(
      new GetPaymentByReservationIdQuery(reservationId),
    );
  }

  async getPaymentById(paymentId: string): Promise<PaymentReadModel> {
    return this.queryBus.execute(new GetPaymentByIdQuery(paymentId));
  }
}
