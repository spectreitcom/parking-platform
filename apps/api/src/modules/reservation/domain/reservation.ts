import { AggregateRoot } from '@nestjs/cqrs';
import { ReservationId } from 'src/modules/reservation/domain/value-objects/reservation-id';
import { ReservationLine } from 'src/modules/reservation/domain/value-objects/reservation-line';
import { CartId } from 'src/modules/reservation/domain/value-objects/cart-id';
import { ParkingSpotId } from 'src/modules/reservation/domain/value-objects/parking-spot-id';
import { UserId } from 'src/modules/reservation/domain/value-objects/user-id';
import { ReservationDateRange } from 'src/modules/reservation/domain/value-objects/reservation-date-range';
import { Money } from 'src/shared/value-objects/money';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { ReservationStatus } from 'src/modules/reservation/domain/value-objects/reservation-status';
import { RegistrationNumber } from 'src/modules/reservation/domain/value-objects/registration-number';
import { ReservationCancelledEvent } from 'src/modules/reservation/domain/events/reservation-cancelled.event';
import {
  CancellingReservationError,
  UpdateReservationError,
} from 'src/modules/reservation/domain/errors';
import { ReservationCreatedEvent } from 'src/modules/reservation/domain/events/reservation-created.event';
import { ReservationUpdatedEvent } from 'src/modules/reservation/domain/events/reservation-updated.event';
import { ReservationAddon } from 'src/modules/reservation/domain/value-objects/reservation-addon';

export class Reservation extends AggregateRoot {
  private readonly id: ReservationId;
  private readonly cartId: CartId;
  private readonly parkingSpotId: ParkingSpotId;
  private readonly userId: UserId;
  private readonly dateRange: ReservationDateRange;
  private readonly lines: ReservationLine[];
  private readonly total: Money;
  private version: AggregateVersion;
  private status: ReservationStatus;
  private registrationNumber: RegistrationNumber;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private readonly addons: ReservationAddon[];

  private constructor(
    id: ReservationId,
    cartId: CartId,
    parkingSpotId: ParkingSpotId,
    userId: UserId,
    dateRange: ReservationDateRange,
    lines: ReservationLine[],
    total: Money,
    version: AggregateVersion,
    status: ReservationStatus,
    registrationNumber: RegistrationNumber,
    addons: ReservationAddon[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.id = id;
    this.cartId = cartId;
    this.parkingSpotId = parkingSpotId;
    this.userId = userId;
    this.dateRange = dateRange;
    this.lines = [...lines];
    this.total = total;
    this.version = version;
    this.status = status;
    this.registrationNumber = registrationNumber;
    this.addons = [...addons];
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  static reconstruct(
    id: ReservationId,
    cartId: CartId,
    parkingSpotId: ParkingSpotId,
    userId: UserId,
    dateRange: ReservationDateRange,
    lines: ReservationLine[],
    total: Money,
    version: AggregateVersion,
    status: ReservationStatus,
    registrationNumber: RegistrationNumber,
    addons: ReservationAddon[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    return new Reservation(
      id,
      cartId,
      parkingSpotId,
      userId,
      dateRange,
      lines,
      total,
      version,
      status,
      registrationNumber,
      addons,
      createdAt,
      updatedAt,
    );
  }

  static create(
    cartId: string,
    parkingSpotId: string,
    userId: string,
    arrivalDate: number,
    departureDate: number,
    lines: { title: string; price: number }[],
    registrationNumber: string,
    addons: string[],
  ) {
    const id = ReservationId.create();
    const status = ReservationStatus.created();
    const createdAt = new Date();
    const updatedAt = new Date();
    const _cartId = CartId.fromString(cartId);
    const _parkingSpotId = ParkingSpotId.fromString(parkingSpotId);
    const _userId = UserId.fromString(userId);
    const _dateRange = ReservationDateRange.fromValues(
      arrivalDate,
      departureDate,
    );
    const _lines = lines.map((line) =>
      ReservationLine.create(line.title, line.price),
    );
    const _registrationNumber =
      RegistrationNumber.fromString(registrationNumber);

    const version = AggregateVersion.one();

    const total = _lines.reduce((acc, line) => acc + line.price, 0);

    const _addons = addons.map((addon) => ReservationAddon.fromString(addon));

    const reservation = new Reservation(
      id,
      _cartId,
      _parkingSpotId,
      _userId,
      _dateRange,
      _lines,
      Money.fromNumber(total),
      version,
      status,
      _registrationNumber,
      _addons,
      new Date(createdAt),
      new Date(updatedAt),
    );

    reservation.apply(
      new ReservationCreatedEvent(
        id.value,
        _cartId.value,
        _parkingSpotId.value,
        _userId.value,
        _dateRange.arrival,
        _dateRange.departure,
        _lines.map((line) => ({
          title: line.title,
          price: line.price,
        })),
        total,
        version.value,
        status.value,
        _registrationNumber.value,
        _addons.map((addon) => addon.value),
        new Date(createdAt),
        new Date(updatedAt),
      ),
    );

    return reservation;
  }

  cancel() {
    if (this.status.equals(ReservationStatus.cancelled())) {
      throw new CancellingReservationError('Reservation is already cancelled.');
    }

    const canCancel15MinutesBefore = this.addons.find((addon) =>
      addon.equals(ReservationAddon.canCancel15MinutesBefore()),
    );

    if (canCancel15MinutesBefore) {
      const now = Date.now();
      const arrival = this.dateRange.arrival;
      const diff = arrival - now;
      if (diff < 15 * 60 * 1000) {
        throw new CancellingReservationError();
      }
    } else {
      const now = Date.now();
      const arrival = this.dateRange.arrival;
      const diff = arrival - now;
      if (diff < 24 * 60 * 60 * 1000) {
        throw new CancellingReservationError();
      }
    }

    this.status = ReservationStatus.cancelled();
    this.updatedAt = new Date();
    this.version = this.version.increment();

    this.apply(
      new ReservationCancelledEvent(
        this.id.value,
        this.version.value,
        this.status.value,
        new Date(this.updatedAt),
      ),
    );
  }

  update(registrationNumber: string) {
    if (this.status.equals(ReservationStatus.cancelled())) {
      throw new UpdateReservationError();
    }

    this.registrationNumber = RegistrationNumber.fromString(registrationNumber);
    this.version = this.version.increment();
    this.updatedAt = new Date();

    this.apply(
      new ReservationUpdatedEvent(
        this.id.value,
        this.cartId.value,
        this.parkingSpotId.value,
        this.userId.value,
        this.dateRange.arrival,
        this.dateRange.departure,
        this.lines.map((line) => ({
          title: line.title,
          price: line.price,
        })),
        this.total.value,
        this.version.value,
        this.status.value,
        this.registrationNumber.value,
        this.addons.map((addon) => addon.value),
        new Date(this.createdAt),
        new Date(this.updatedAt),
      ),
    );
  }

  getId() {
    return this.id;
  }

  getCartId() {
    return this.cartId;
  }

  getParkingSpotId() {
    return this.parkingSpotId;
  }

  getUserId() {
    return this.userId;
  }

  getDateRange() {
    return this.dateRange;
  }

  getLines() {
    return [...this.lines];
  }

  getTotal() {
    return this.total;
  }

  getVersion() {
    return this.version;
  }

  getStatus() {
    return this.status;
  }

  getRegistrationNumber() {
    return this.registrationNumber;
  }

  getCreatedAt() {
    return new Date(this.createdAt);
  }

  getUpdatedAt() {
    return new Date(this.updatedAt);
  }

  getAddons() {
    return [...this.addons];
  }
}
