import { Organization } from '../../domain/organization';
import { RepositorySaveOptions } from '../../../../shared/types';
import { PrismaTx } from '../../../../shared/prisma/types';

export abstract class OrganizationRepository {
  abstract save(
    organization: Organization,
    options?: RepositorySaveOptions,
  ): Promise<void>;
  abstract findById(id: string, tx?: PrismaTx): Promise<Organization | null>;
}
