import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ReservationCreatedEvent } from '../../domain/events/reservation-created.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(ReservationCreatedEvent)
export class ReservationCreatedEventHandler implements IEventHandler<ReservationCreatedEvent> {
  private readonly logger = new Logger(ReservationCreatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: ReservationCreatedEvent) {
    this.logger.log(`Reservation created: ${event.reservationId}`);

    const {
      reservationId,
      createdAt,
      total,
      version,
      endDate,
      startDate,
      lines,
      status,
      registrationNumber,
      updatedAt,
      userId,
      parkingSpotId,
      cartId,
      addons,
      parkingId,
    } = event;

    await this.prismaService.reservationRead.create({
      data: {
        reservationId,
        createdAt,
        total,
        version,
        userId,
        parkingSpotId,
        cartId,
        lines,
        status,
        registrationNumber,
        updatedAt,
        addons,
        parkingId,
        arrival: startDate,
        departure: endDate,
      },
    });
  }
}
