import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ReservationCancelledV1Payload,
  ReservationIntegrationEventTypes,
} from '@repo/api-contracts';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

type Event = IntegrationEvent<
  ReservationCancelledV1Payload,
  ReservationIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class ReservationCancelledIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(ReservationCancelledIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'reservation.reservation.cancelled.v1') return;

    this.logger.log(`Handling event: ${event.type}`);

    const { reservationId } = event.payload;

    await this.prismaService.payment.update({
      where: { reservationId, paidAt: null, shouldCancel: false },
      data: {
        shouldCancel: false,
      },
    });
  }
}
