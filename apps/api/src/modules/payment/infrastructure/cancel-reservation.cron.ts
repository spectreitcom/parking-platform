import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  PaymentExpiredV1Payload,
  PaymentIntegrationEventTypes,
} from '@repo/api-contracts';

@Injectable()
export class CancelReservationCron {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handle() {
    const records = await this.prismaService.payment.findMany({
      where: {
        paidAt: null,
        shouldCancel: true,
        createdAt: {
          lt: new Date(Date.now() - 1000 * 60 * 15),
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
        },
        'payment',
        'payment',
        record.id,
      );

      await this.outboxService.enqueue(
        event,
        { deduplicate: true },
        this.prismaService,
      );
    }
  }
}
