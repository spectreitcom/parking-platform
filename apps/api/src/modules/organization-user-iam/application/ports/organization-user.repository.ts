import { OrganizationUser } from '../../domain/organization-user';
import { RepositorySaveOptions } from '../../../../shared/types';
import { PrismaTx } from '../../../../shared/prisma/types';

export abstract class OrganizationUserRepository {
  abstract save(
    organizationUser: OrganizationUser,
    options?: RepositorySaveOptions,
  ): Promise<void>;
  abstract findById(
    id: string,
    tx?: PrismaTx,
  ): Promise<OrganizationUser | null>;
  abstract findByEmail(
    email: string,
    tx?: PrismaTx,
  ): Promise<OrganizationUser | null>;
}
