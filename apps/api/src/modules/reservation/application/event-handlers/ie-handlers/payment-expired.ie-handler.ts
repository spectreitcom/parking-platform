import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  PaymentExpiredV1Payload,
  PaymentIntegrationEventTypes,
} from '@repo/api-contracts';
import { Logger } from '@nestjs/common';
import { CancelReservationCommand } from '../../commands/cancel-reservation.command';
import { PrismaService } from 'src/shared/prisma/prisma.service';

type Event = IntegrationEvent<
  PaymentExpiredV1Payload,
  PaymentIntegrationEventTypes
>;

@EventsHandler(IntegrationEvent)
export class PaymentExpiredIeHandler implements IEventHandler<Event> {
  private readonly logger = new Logger(PaymentExpiredIeHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly prismaService: PrismaService,
  ) {}

  async handle(event: Event) {
    if (event.type !== 'payment.payment.expired.v1') return;
    this.logger.log(`Handling payment expired event`, event);

    const { reservationId, userId } = event.payload;

    const reservation = await this.prismaService.reservationRead.findUnique({
      where: {
        reservationId,
      },
    });

    if (!reservation) return;

    await this.commandBus.execute(
      new CancelReservationCommand(
        reservationId,
        userId,
        reservation.version,
        true,
      ),
    );
  }
}
