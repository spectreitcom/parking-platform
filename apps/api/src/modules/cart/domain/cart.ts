import { CartId } from './value-objects/cart-id';
import { CartDateRange } from './value-objects/cart-date-range';
import { Money } from '../../../shared/value-objects/money';
import { CartParkingSpotId } from './value-objects/cart-parking-spot-id';
import { CartAddon } from './entities/cart-addon';
import { AggregateRoot } from '@nestjs/cqrs';
import { CartAddonId } from './value-objects/cart-addon-id';
import { CartInvalidError } from './errors';
import { CartUserId } from './value-objects/cart-user-id';
import { CartAddonRaw } from '../application/types';

export class Cart extends AggregateRoot {
  private readonly id: CartId;
  private dateRange: CartDateRange;
  private readonly pricePerDay: Money;
  private readonly parkingSpotId: CartParkingSpotId;
  private addons: CartAddon[];
  private readonly createdAt: Date;
  private readonly userId?: CartUserId;

  private constructor(
    id: CartId,
    dateRange: CartDateRange,
    pricePerDay: Money,
    parkingSpotId: CartParkingSpotId,
    addons: CartAddon[],
    createdAt: Date,
    userId?: CartUserId,
  ) {
    super();
    this.id = id;
    this.dateRange = dateRange;
    this.pricePerDay = pricePerDay;
    this.parkingSpotId = parkingSpotId;
    this.addons = addons;
    this.createdAt = createdAt;
    this.userId = userId;
  }

  static create(
    parkingSpotId: string,
    arrival: number,
    departure: number,
    pricePerDay: number,
    userId?: string,
  ) {
    const id = CartId.create();
    const dateRange = CartDateRange.fromValues(arrival, departure);
    const _pricePerDay = Money.fromNumber(pricePerDay);
    const _cartParkingSpotId = CartParkingSpotId.fromString(parkingSpotId);
    const _userId = userId ? CartUserId.fromString(userId) : undefined;

    return new Cart(
      id,
      dateRange,
      _pricePerDay,
      _cartParkingSpotId,
      [],
      new Date(),
      _userId,
    );
  }

  static reconstruct(
    id: CartId,
    dateRange: CartDateRange,
    pricePerDay: Money,
    parkingSpotId: CartParkingSpotId,
    addons: readonly CartAddon[],
    createdAt: Date,
    userId?: CartUserId,
  ) {
    return new Cart(
      id,
      dateRange,
      pricePerDay,
      parkingSpotId,
      [...addons],
      createdAt,
      userId,
    );
  }

  update(arrival: number, departure: number, addons: CartAddonRaw[]) {
    this.dateRange = CartDateRange.fromValues(arrival, departure);
    this.addons = addons.map(
      (addon) =>
        new CartAddon(
          CartAddonId.fromString(addon.id),
          Money.fromNumber(addon.price),
        ),
    );
  }

  validate() {
    const now = Date.now();

    if (now - this.createdAt.getTime() >= 1000 * 60 * 20) {
      throw new CartInvalidError(`Cart is expired.`);
    }

    if (now - this.dateRange.arrival > 0) {
      throw new CartInvalidError(`Arrival date is in the past.`);
    }
  }

  getId() {
    return this.id;
  }

  getDateRange() {
    return this.dateRange;
  }

  getPricePerDay() {
    return this.pricePerDay;
  }

  getParkingSpotId() {
    return this.parkingSpotId;
  }

  getAddons() {
    return [...this.addons];
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getTotal() {
    let total = Money.zero();

    this.addons.forEach((addon) => {
      total = total.add(addon.price);
    });

    total = total.add(
      this.pricePerDay.multiplyByNumber(this.dateRange.diffDays),
    );

    return total;
  }

  getUserId() {
    return this.userId;
  }
}
