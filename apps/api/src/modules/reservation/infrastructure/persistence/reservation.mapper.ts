import { Reservation as ReservationModel } from '@prisma/client';
import { Reservation } from '../../domain/reservation';
import { ReservationId } from '../../domain/value-objects/reservation-id';
import { CartId } from '../../domain/value-objects/cart-id';
import { ParkingSpotId } from '../../domain/value-objects/parking-spot-id';
import { UserId } from '../../domain/value-objects/user-id';
import { ReservationDateRange } from '../../domain/value-objects/reservation-date-range';
import { Money } from 'src/shared/value-objects/money';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { ReservationStatus } from '../../domain/value-objects/reservation-status';
import { RegistrationNumber } from '../../domain/value-objects/registration-number';
import { ReservationLine } from '../../domain/value-objects/reservation-line';
import { z } from 'zod';
import { ReservationAddon } from '../../domain/value-objects/reservation-addon';

const linesSchema = z.array(z.object({ title: z.string(), price: z.number() }));

export class ReservationMapper {
  static toDomain(raw: ReservationModel) {
    const validationResult = linesSchema.safeParse(raw.lines);
    if (!validationResult.success) {
      throw new Error('Invalid reservation lines format');
    }

    return Reservation.reconstruct(
      ReservationId.fromString(raw.id),
      CartId.fromString(raw.cartId),
      ParkingSpotId.fromString(raw.parkingSpotId),
      UserId.fromString(raw.userId),
      ReservationDateRange.fromValues(raw.arrival, raw.departure),
      validationResult.data.map((line) =>
        ReservationLine.create(line.title, line.price),
      ),
      Money.fromNumber(raw.total),
      AggregateVersion.fromNumber(raw.version),
      ReservationStatus.fromString(raw.status),
      RegistrationNumber.fromString(raw.registrationNumber),
      raw.addons.map((addon) => ReservationAddon.fromString(addon)),
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(reservation: Reservation) {
    return {
      id: reservation.getId().value,
      status: reservation.getStatus().value,
      lines: reservation.getLines().map((line) => ({
        title: line.title,
        price: line.price,
      })),
      version: reservation.getVersion().value,
      registrationNumber: reservation.getRegistrationNumber().value,
      total: reservation.getTotal().value,
      arrival: reservation.getDateRange().arrival,
      departure: reservation.getDateRange().departure,
      cartId: reservation.getCartId().value,
      parkingSpotId: reservation.getParkingSpotId().value,
      userId: reservation.getUserId().value,
      createdAt: reservation.getCreatedAt(),
      updatedAt: reservation.getUpdatedAt(),
      addons: reservation.getAddons().map((addon) => addon.value),
    } satisfies ReservationModel;
  }
}
