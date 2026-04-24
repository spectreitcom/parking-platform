import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ReservationUpdatedEvent } from '../../domain/events/reservation-updated.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ReservationUpdatedEvent)
export class ReservationUpdatedEventHandler implements IEventHandler<ReservationUpdatedEvent> {
  private readonly logger = new Logger(ReservationUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ReservationUpdatedEvent) {
    this.logger.log(
      `Handling ReservationUpdatedEvent for reservationId: ${event.reservationId}`,
    );

    const {
      reservationId,
      version,
      registrationNumber,
      updatedAt,
      userId,
      status,
      cartId,
      parkingSpotId,
      total,
      lines,
      addons,
      startDate,
      endDate,
    } = event;

    await this.prismaService.reservationRead.update({
      where: {
        reservationId,
      },
      data: {
        registrationNumber,
        updatedAt,
        userId,
        status,
        cartId,
        parkingSpotId,
        total,
        lines,
        addons,
        startDate,
        endDate,
        version,
      },
    });
  }
}
