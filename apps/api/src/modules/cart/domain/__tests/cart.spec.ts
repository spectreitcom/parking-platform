import { Cart } from '../cart';
import { CartInvalidError } from '../errors';
import { CartId } from '../value-objects/cart-id';
import { CartDateRange } from '../value-objects/cart-date-range';
import { Money } from 'src/shared/value-objects/money';
import { CartParkingSpotId } from '../value-objects/cart-parking-spot-id';
import { CartAddon } from '../entities/cart-addon';
import { CartAddonId } from '../value-objects/cart-addon-id';
import { CartUserId } from '../value-objects/cart-user-id';
import { randomUUID } from 'node:crypto';

describe('Cart', () => {
  const parkingSpotId = randomUUID();
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const tomorrow = now + oneDayInMs;
  const dayAfterTomorrow = tomorrow + oneDayInMs;
  const pricePerDay = 1000; // 10.00 PLN

  describe('create', () => {
    it('should create a new cart with initial values', () => {
      const cart = Cart.create(
        parkingSpotId,
        tomorrow,
        dayAfterTomorrow,
        pricePerDay,
      );

      expect(cart.getId()).toBeDefined();
      expect(cart.getParkingSpotId().value).toBe(parkingSpotId);
      expect(cart.getDateRange().arrival).toBe(tomorrow);
      expect(cart.getDateRange().departure).toBe(dayAfterTomorrow);
      expect(cart.getPricePerDay().value).toBe(pricePerDay);
      expect(cart.getAddons()).toHaveLength(0);
      expect(cart.getCreatedAt()).toBeInstanceOf(Date);
      expect(cart.getUserId()).toBeUndefined();
    });

    it('should create a new cart with user id', () => {
      const userId = randomUUID();
      const cart = Cart.create(
        parkingSpotId,
        tomorrow,
        dayAfterTomorrow,
        pricePerDay,
        userId,
      );

      expect(cart.getUserId()).toBeDefined();
      expect(cart.getUserId()?.value).toBe(userId);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct cart from values', () => {
      const id = randomUUID();
      const arrival = tomorrow;
      const departure = dayAfterTomorrow;
      const createdAt = new Date();
      const userId = randomUUID();
      const addonId = randomUUID();

      const cart = Cart.reconstruct(
        CartId.fromString(id),
        CartDateRange.fromValues(arrival, departure),
        Money.fromNumber(pricePerDay),
        CartParkingSpotId.fromString(parkingSpotId),
        [new CartAddon(CartAddonId.fromString(addonId), Money.fromNumber(500))],
        createdAt,
        CartUserId.fromString(userId),
      );

      expect(cart.getId().value).toBe(id);
      expect(cart.getDateRange().arrival).toBe(arrival);
      expect(cart.getDateRange().departure).toBe(departure);
      expect(cart.getPricePerDay().value).toBe(pricePerDay);
      expect(cart.getParkingSpotId().value).toBe(parkingSpotId);
      expect(cart.getAddons()).toHaveLength(1);
      expect(cart.getAddons()[0].id.value).toBe(addonId);
      expect(cart.getCreatedAt()).toBe(createdAt);
      expect(cart.getUserId()?.value).toBe(userId);
    });
  });

  describe('update', () => {
    it('should update date range and addons', () => {
      const cart = Cart.create(
        parkingSpotId,
        tomorrow,
        dayAfterTomorrow,
        pricePerDay,
      );
      const newArrival = tomorrow + oneDayInMs;
      const newDeparture = dayAfterTomorrow + oneDayInMs;
      const addonId1 = randomUUID();
      const addonId2 = randomUUID();
      const addons = [
        { id: addonId1, price: 500 },
        { id: addonId2, price: 300 },
      ];

      cart.update(newArrival, newDeparture, addons);

      expect(cart.getDateRange().arrival).toBe(newArrival);
      expect(cart.getDateRange().departure).toBe(newDeparture);
      expect(cart.getAddons()).toHaveLength(2);
      expect(cart.getAddons()[0].id.value).toBe(addonId1);
      expect(cart.getAddons()[0].price.value).toBe(500);
      expect(cart.getAddons()[1].id.value).toBe(addonId2);
      expect(cart.getAddons()[1].price.value).toBe(300);
    });
  });

  describe('getTotal', () => {
    it('should calculate total price correctly without addons', () => {
      // 2 days
      const cart = Cart.create(
        parkingSpotId,
        tomorrow,
        tomorrow + 2 * oneDayInMs,
        pricePerDay,
      );

      expect(cart.getTotal().value).toBe(pricePerDay * 2);
    });

    it('should calculate total price correctly with addons', () => {
      // 1 day
      const cart = Cart.create(
        parkingSpotId,
        tomorrow,
        tomorrow + oneDayInMs,
        pricePerDay,
      );
      const addonId1 = randomUUID();
      const addonId2 = randomUUID();
      cart.update(tomorrow, tomorrow + oneDayInMs, [
        { id: addonId1, price: 500 },
        { id: addonId2, price: 300 },
      ]);

      // 1000 (1 day) + 500 + 300 = 1800
      expect(cart.getTotal().value).toBe(1800);
    });
  });

  describe('validate', () => {
    it('should not throw error when cart is valid', () => {
      const cart = Cart.create(
        parkingSpotId,
        tomorrow,
        dayAfterTomorrow,
        pricePerDay,
      );

      expect(() => cart.validate()).not.toThrow();
    });

    it('should throw CartInvalidError when arrival date is in the past', () => {
      const pastArrival = now - oneDayInMs;
      const cart = Cart.create(
        parkingSpotId,
        pastArrival,
        tomorrow,
        pricePerDay,
      );

      expect(() => cart.validate()).toThrow(CartInvalidError);
      expect(() => cart.validate()).toThrow('Arrival date is in the past.');
    });

    it('should throw CartInvalidError when cart is expired', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(now));

      const cart = Cart.create(
        parkingSpotId,
        tomorrow,
        dayAfterTomorrow,
        pricePerDay,
      );

      // Advance time by 21 minutes (expiration is 20 minutes)
      jest.advanceTimersByTime(21 * 60 * 1000);

      expect(() => cart.validate()).toThrow(CartInvalidError);
      expect(() => cart.validate()).toThrow('Cart is expired.');

      jest.useRealTimers();
    });
  });
});
