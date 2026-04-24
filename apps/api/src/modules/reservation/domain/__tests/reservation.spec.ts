import { randomUUID } from 'node:crypto';
import { Reservation } from '../reservation';
import { ReservationId } from '../value-objects/reservation-id';
import { CartId } from '../value-objects/cart-id';
import { ParkingSpotId } from '../value-objects/parking-spot-id';
import { UserId } from '../value-objects/user-id';
import { ReservationDateRange } from '../value-objects/reservation-date-range';
import { ReservationStatus } from '../value-objects/reservation-status';
import { RegistrationNumber } from '../value-objects/registration-number';
import { ReservationAddon } from '../value-objects/reservation-addon';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { Money } from 'src/shared/value-objects/money';
import { ReservationLine } from '../value-objects/reservation-line';
import { ReservationCreatedEvent } from '../events/reservation-created.event';
import { CancellingReservationError, UpdateReservationError } from '../errors';
import { ReservationCancelledEvent } from '../events/reservation-cancelled.event';
import { ReservationUpdatedEvent } from '../events/reservation-updated.event';
import { ADDON_CAN_CANCEL_15_MINUTES_BEFORE } from '../constants';

describe('Reservation', () => {
  const cartId = randomUUID();
  const parkingSpotId = randomUUID();
  const userId = randomUUID();
  const arrivalDate = Date.now() + 2 * 24 * 60 * 60 * 1000; // 2 days from now
  const departureDate = arrivalDate + 2 * 60 * 60 * 1000; // 2 hours later
  const lines = [{ title: 'Parking', price: 100 }];
  const registrationNumber = 'XYZ-123';
  const addons: string[] = [];

  describe('create', () => {
    it('should create a reservation and apply ReservationCreatedEvent', () => {
      const reservation = Reservation.create(
        cartId,
        parkingSpotId,
        userId,
        arrivalDate,
        departureDate,
        lines,
        registrationNumber,
        addons,
      );

      expect(reservation.getId()).toBeDefined();
      expect(reservation.getCartId().value).toBe(cartId);
      expect(reservation.getParkingSpotId().value).toBe(parkingSpotId);
      expect(reservation.getUserId().value).toBe(userId);
      expect(reservation.getDateRange().arrival).toBe(arrivalDate);
      expect(reservation.getDateRange().departure).toBe(departureDate);
      expect(reservation.getLines()).toHaveLength(1);
      expect(reservation.getTotal().value).toBe(100);
      expect(reservation.getStatus().value).toBe(
        ReservationStatus.created().value,
      );
      expect(reservation.getRegistrationNumber().value).toBe(
        registrationNumber,
      );
      expect(reservation.getAddons()).toHaveLength(0);
      expect(reservation.getVersion().value).toBe(1);

      const events = reservation.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ReservationCreatedEvent);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct a reservation correctly', () => {
      const id = ReservationId.create();
      const _cartId = CartId.fromString(cartId);
      const _parkingSpotId = ParkingSpotId.fromString(parkingSpotId);
      const _userId = UserId.fromString(userId);
      const _dateRange = ReservationDateRange.fromValues(
        arrivalDate,
        departureDate,
      );
      const _lines = [ReservationLine.create('Parking', 100)];
      const total = Money.fromNumber(100);
      const version = AggregateVersion.one();
      const status = ReservationStatus.created();
      const _registrationNumber =
        RegistrationNumber.fromString(registrationNumber);
      const _addons: ReservationAddon[] = [];
      const createdAt = new Date();
      const updatedAt = new Date();

      const reservation = Reservation.reconstruct(
        id,
        _cartId,
        _parkingSpotId,
        _userId,
        _dateRange,
        _lines,
        total,
        version,
        status,
        _registrationNumber,
        _addons,
        createdAt,
        updatedAt,
      );

      expect(reservation.getId()).toBe(id);
      expect(reservation.getCartId()).toBe(_cartId);
      expect(reservation.getStatus()).toBe(status);
      expect(reservation.getUncommittedEvents()).toHaveLength(0);
    });
  });

  describe('cancel', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should cancel a reservation if it is more than 24 hours before arrival', () => {
      const now = new Date('2026-04-24T12:00:00Z');
      jest.setSystemTime(now);

      const arrival = now.getTime() + 25 * 60 * 60 * 1000; // 25 hours later
      const reservation = Reservation.create(
        cartId,
        parkingSpotId,
        userId,
        arrival,
        arrival + 3600,
        lines,
        registrationNumber,
        [],
      );

      reservation.cancel();

      expect(reservation.getStatus().value).toBe(
        ReservationStatus.cancelled().value,
      );
      expect(reservation.getVersion().value).toBe(2);

      const events = reservation.getUncommittedEvents();
      // event 0 is Created, event 1 is Cancelled
      expect(events[1]).toBeInstanceOf(ReservationCancelledEvent);
    });

    it('should throw CancellingReservationError if it is less than 24 hours before arrival and no special addon', () => {
      const now = new Date('2026-04-24T12:00:00Z');
      jest.setSystemTime(now);

      const arrival = now.getTime() + 23 * 60 * 60 * 1000; // 23 hours later
      const reservation = Reservation.create(
        cartId,
        parkingSpotId,
        userId,
        arrival,
        arrival + 3600,
        lines,
        registrationNumber,
        [],
      );

      expect(() => reservation.cancel()).toThrow(CancellingReservationError);
    });

    it('should cancel a reservation if it has 15min addon and it is more than 15 minutes before arrival', () => {
      const now = new Date('2026-04-24T12:00:00Z');
      jest.setSystemTime(now);

      const arrival = now.getTime() + 16 * 60 * 1000; // 16 minutes later
      const reservation = Reservation.create(
        cartId,
        parkingSpotId,
        userId,
        arrival,
        arrival + 3600,
        lines,
        registrationNumber,
        [ADDON_CAN_CANCEL_15_MINUTES_BEFORE],
      );

      reservation.cancel();

      expect(reservation.getStatus().value).toBe(
        ReservationStatus.cancelled().value,
      );
    });

    it('should throw CancellingReservationError if it has 15min addon and it is less than 15 minutes before arrival', () => {
      const now = new Date('2026-04-24T12:00:00Z');
      jest.setSystemTime(now);

      const arrival = now.getTime() + 14 * 60 * 1000; // 14 minutes later
      const reservation = Reservation.create(
        cartId,
        parkingSpotId,
        userId,
        arrival,
        arrival + 3600,
        lines,
        registrationNumber,
        [ADDON_CAN_CANCEL_15_MINUTES_BEFORE],
      );

      expect(() => reservation.cancel()).toThrow(CancellingReservationError);
    });

    it('should throw CancellingReservationError if already cancelled', () => {
      const now = new Date('2026-04-24T12:00:00Z');
      jest.setSystemTime(now);
      const arrival = now.getTime() + 48 * 60 * 60 * 1000;
      const reservation = Reservation.create(
        cartId,
        parkingSpotId,
        userId,
        arrival,
        arrival + 3600,
        lines,
        registrationNumber,
        [],
      );

      reservation.cancel();
      expect(() => reservation.cancel()).toThrow(
        'Reservation is already cancelled.',
      );
    });
  });

  describe('update', () => {
    it('should update registration number and apply ReservationUpdatedEvent', () => {
      const reservation = Reservation.create(
        cartId,
        parkingSpotId,
        userId,
        arrivalDate,
        departureDate,
        lines,
        registrationNumber,
        addons,
      );

      const newRegNumber = 'ABC-999';
      reservation.update(newRegNumber);

      expect(reservation.getRegistrationNumber().value).toBe(newRegNumber);
      expect(reservation.getVersion().value).toBe(2);

      const events = reservation.getUncommittedEvents();
      expect(events[1]).toBeInstanceOf(ReservationUpdatedEvent);
    });

    it('should throw UpdateReservationError if reservation is cancelled', () => {
      const now = Date.now();
      const arrival = now + 48 * 60 * 60 * 1000;
      const reservation = Reservation.create(
        cartId,
        parkingSpotId,
        userId,
        arrival,
        arrival + 3600,
        lines,
        registrationNumber,
        [],
      );

      reservation.cancel();

      expect(() => reservation.update('NEW-123')).toThrow(
        UpdateReservationError,
      );
    });
  });

  describe('defensive copies', () => {
    it('should not allow external mutation of createdAt Date object passed to reconstruct', () => {
      const createdAt = new Date('2023-01-01T00:00:00Z');
      const reservation = Reservation.reconstruct(
        ReservationId.create(),
        CartId.fromString(randomUUID()),
        ParkingSpotId.fromString(randomUUID()),
        UserId.fromString(randomUUID()),
        ReservationDateRange.fromValues(Date.now(), Date.now() + 3600),
        [],
        Money.zero(),
        AggregateVersion.one(),
        ReservationStatus.created(),
        RegistrationNumber.fromString('ABC-123'),
        [],
        createdAt,
        new Date(),
      );

      createdAt.setFullYear(2024);
      expect(reservation.getCreatedAt().getFullYear()).toBe(2023);
    });

    it('should not allow external mutation of Date object returned by getCreatedAt', () => {
      const reservation = Reservation.reconstruct(
        ReservationId.create(),
        CartId.fromString(randomUUID()),
        ParkingSpotId.fromString(randomUUID()),
        UserId.fromString(randomUUID()),
        ReservationDateRange.fromValues(Date.now(), Date.now() + 3600),
        [],
        Money.zero(),
        AggregateVersion.one(),
        ReservationStatus.created(),
        RegistrationNumber.fromString('ABC-123'),
        [],
        new Date('2023-01-01T00:00:00Z'),
        new Date(),
      );

      const createdAtFromGetter = reservation.getCreatedAt();
      createdAtFromGetter.setFullYear(2024);
      expect(reservation.getCreatedAt().getFullYear()).toBe(2023);
    });

    it('should not allow external mutation of lines array passed to reconstruct', () => {
      const linesArr = [ReservationLine.create('Test', 100)];
      const reservation = Reservation.reconstruct(
        ReservationId.create(),
        CartId.fromString(randomUUID()),
        ParkingSpotId.fromString(randomUUID()),
        UserId.fromString(randomUUID()),
        ReservationDateRange.fromValues(Date.now(), Date.now() + 3600),
        linesArr,
        Money.fromNumber(100),
        AggregateVersion.one(),
        ReservationStatus.created(),
        RegistrationNumber.fromString('ABC-123'),
        [],
        new Date(),
        new Date(),
      );

      linesArr.push(ReservationLine.create('Another', 200));
      expect(reservation.getLines()).toHaveLength(1);
    });

    it('should not allow external mutation of lines array returned by getter', () => {
      const reservation = Reservation.reconstruct(
        ReservationId.create(),
        CartId.fromString(randomUUID()),
        ParkingSpotId.fromString(randomUUID()),
        UserId.fromString(randomUUID()),
        ReservationDateRange.fromValues(Date.now(), Date.now() + 3600),
        [ReservationLine.create('Test', 100)],
        Money.fromNumber(100),
        AggregateVersion.one(),
        ReservationStatus.created(),
        RegistrationNumber.fromString('ABC-123'),
        [],
        new Date(),
        new Date(),
      );

      const linesFromGetter = reservation.getLines();
      linesFromGetter.push(ReservationLine.create('Another', 200));
      expect(reservation.getLines()).toHaveLength(1);
    });
  });
});
