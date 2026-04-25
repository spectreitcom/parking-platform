import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ReservationCancelledEvent } from '../../domain/events/reservation-cancelled.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ReservationCancelledEvent)
export class ReservationCancelledEventHandler implements IEventHandler<ReservationCancelledEvent> {
  private readonly logger = new Logger(ReservationCancelledEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ReservationCancelledEvent) {
    this.logger.log(`Reservation cancelled: ${event.reservationId}`);

    const { reservationId, version, updatedAt, status } = event;

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
