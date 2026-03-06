import { AdminUser } from '../../domain/admin-user';
import { RepositorySaveOptions } from '../../../../shared/types';
import { PrismaTx } from '../../../../shared/prisma/types';

export abstract class AdminUserRepository {
  abstract save(
    adminUser: AdminUser,
    options?: RepositorySaveOptions,
  ): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<AdminUser | null>;
}
