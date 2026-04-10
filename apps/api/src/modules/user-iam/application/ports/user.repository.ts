import { User } from 'src/modules/user-iam/domain/user';
import { PrismaTx } from 'src/shared/prisma/types';
import { RepositorySaveOptions } from 'src/shared/types';

export abstract class UserRepository {
  abstract save(user: User, options?: RepositorySaveOptions): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<User | null>;
  abstract findByEmail(email: string, tx?: PrismaTx): Promise<User | null>;
}
