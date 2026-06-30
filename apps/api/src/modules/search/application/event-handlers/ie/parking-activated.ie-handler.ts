import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  ParkingActivatedV1Payload,
  ParkingIntegrationEventTypes,
} from '@repo/api-contracts';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Logger } from '@nestjs/common';

type Event = IntegrationEvent<
  ParkingActivatedV1Payload,
  ParkingIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class ParkingActivatedIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(ParkingActivatedIeHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: Event) {
    if (event.type !== 'parking.parking.activated.v1') return;

    this.logger.debug(
      `Received parking activated event: ${JSON.stringify(event)}`,
    );

    const { parkingId } = event.payload;

    await this.prismaService.search.update({
      where: { parkingId },
      data: { active: true },
    });
  }
}
