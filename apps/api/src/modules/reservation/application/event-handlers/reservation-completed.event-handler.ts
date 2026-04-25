import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ReservationCompletedEvent } from '../../domain/events/reservation-completed.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ReservationCompletedEvent)
export class ReservationCompletedEventHandler implements IEventHandler<ReservationCompletedEvent> {
  private readonly logger = new Logger(ReservationCompletedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ReservationCompletedEvent) {
    this.logger.log(
      `Handling reservation completed event for reservation ${event.reservationId}`,
    );
    const { reservationId, version, status, updatedAt } = event;

    await this.prismaService.reservationRead.update({
      where: {
        reservationId,
      },
      data: {
        status,
        updatedAt,
        version,
      },
    });
  }
}
