import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';
import type { RequestUser } from '../../../auth/types';

@Injectable()
export class GetManagerMeHandler implements IControllerHandler {
  constructor(
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
    private readonly organizationFacade: OrganizationFacade,
  ) {}

  async handle(managerUser: RequestUser) {
    const isRootMap = new Map<string, boolean>(
      managerUser.organizations.map((org) => [org.organizationId, org.isRoot]),
    );

    const [organizationRecords, organizationUser] = await Promise.all([
      this.organizationFacade.getOrganizationByIds(
        managerUser.organizations.map((org) => org.organizationId),
      ),
      this.organizationUserIamFacade.getOrganizationUserById(managerUser.id),
    ]);

    const organizations: (Pick<
      (typeof organizationRecords)[number],
      'id' | 'name'
    > & {
      isRoot: boolean;
    })[] = [];

    for (const orgRecord of organizationRecords) {
      organizations.push({
        id: orgRecord.id,
        name: orgRecord.name,
        isRoot: isRootMap.get(orgRecord.id) ?? false,
      });
    }

    return {
      ...organizationUser,
      organizations,
    } satisfies typeof organizationUser & {
      organizations: {
        id: string;
        name: string;
        isRoot: boolean;
      }[];
    };
  }
}
