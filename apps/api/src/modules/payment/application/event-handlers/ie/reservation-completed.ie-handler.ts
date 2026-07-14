import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ReservationCompletedV1Payload,
  ReservationIntegrationEventTypes,
} from '@repo/api-contracts';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

type Event = IntegrationEvent<
  ReservationCompletedV1Payload,
  ReservationIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class ReservationCompletedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(ReservationCompletedIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'reservation.reservation.completed.v1') return;

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
