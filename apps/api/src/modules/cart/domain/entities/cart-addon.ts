import { CartAddonId } from '../value-objects/cart-addon-id';
import { Money } from '../../../../shared/value-objects/money';

export class CartAddon {
  constructor(
    public readonly id: CartAddonId,
    public readonly price: Money,
  ) {}
}
