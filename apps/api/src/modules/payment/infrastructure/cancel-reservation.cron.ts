import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  PaymentExpiredV1Payload,
  PaymentIntegrationEventTypes,
} from '@repo/api-contracts';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';

@Injectable()
export class CancelReservationCron {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly outboxService: OutboxService,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handle() {
    return await this.transactionRunner.runInTransaction(async (prisma) => {
      const records = await prisma.payment.findMany({
        where: {
          paidAt: null,
          shouldCancel: true,
          createdAt: {
            lt: new Date(Date.now() - 1000 * 60 * 2),
          },
        },
        take: 100,
      });

      for (const record of records) {
        const event = new IntegrationEvent<
          PaymentExpiredV1Payload,
          PaymentIntegrationEventTypes
        >(
          'payment.payment.expired.v1',
          {
            paymentId: record.id,
            reservationId: record.reservationId,
            userId: record.userId,
          },
          'payment',
          'payment',
          record.id,
        );

        await prisma.payment.update({
          where: { id: record.id },
          data: { shouldCancel: false },
        });

        await this.outboxService.enqueue(event, { deduplicate: true }, prisma);
      }
    });
  }
}
