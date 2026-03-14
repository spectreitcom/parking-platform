import { Cart as CartModel } from '@prisma/client';
import { Cart } from '../../domain/cart';
import { CartId } from '../../domain/value-objects/cart-id';
import { Money } from '../../../../shared/value-objects/money';
import { CartParkingSpotId } from '../../domain/value-objects/cart-parking-spot-id';
import { CartAddon } from '../../domain/entities/cart-addon';
import { CartDateRange } from '../../domain/value-objects/cart-date-range';
import { CartAddonId } from '../../domain/value-objects/cart-addon-id';

export class CartMapper {
  static toDomain(raw: CartModel) {
    let _addons: CartAddon[] = [];

    if (Array.isArray(raw.addons)) {
      _addons = (raw.addons as { id: string; price: number }[]).map(
        (addon) =>
          new CartAddon(
            CartAddonId.fromString(addon.id),
            Money.fromNumber(addon.price),
          ),
      );
    }

    return Cart.reconstruct(
      CartId.fromString(raw.id),
      CartDateRange.fromValues(raw.arrival, raw.departure),
      Money.fromNumber(raw.priceByDay),
      CartParkingSpotId.fromString(raw.parkingSpotId),
      _addons,
      raw.createdAt,
    );
  }

  static toPersistence(cart: Cart): CartModel {
    return {
      id: cart.getId().value,
      parkingSpotId: cart.getParkingSpotId().value,
      arrival: cart.getDateRange().arrival,
      departure: cart.getDateRange().departure,
      days: cart.getDateRange().diffDays,
      priceByDay: cart.getPricePerDay().value,
      createdAt: cart.getCreatedAt(),
      total: cart.getTotal().value,
      userId: cart.getUserId()?.value ?? null,
      addons: cart.getAddons().map((addon) => ({
        id: addon.id.value,
        price: addon.price.value,
      })),
    };
  }
}
