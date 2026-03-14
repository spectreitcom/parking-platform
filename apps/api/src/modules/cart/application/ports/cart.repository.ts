import { Cart } from '../../domain/cart';
import { RepositorySaveOptions } from '../../../../shared/types';
import { PrismaTx } from '../../../../shared/prisma/types';

export abstract class CartRepository {
  abstract save(cart: Cart, options?: RepositorySaveOptions): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<Cart | null>;
}
