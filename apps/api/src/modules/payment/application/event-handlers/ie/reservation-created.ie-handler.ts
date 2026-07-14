import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ReservationCreatedV1Payload,
  ReservationIntegrationEventTypes,
} from '@repo/api-contracts';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

type Event = IntegrationEvent<
  ReservationCreatedV1Payload,
  ReservationIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class ReservationCreatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(ReservationCreatedIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'reservation.reservation.created.v1') return;

    this.logger.log(`Handling event: ${event.type}`);

    const { reservationId, userId, amount } = event.payload;

    await this.prismaService.payment.create({
      data: {
        reservationId,
        userId,
        amount,
        createdAt: new Date(),
      },
    });
  }
}
