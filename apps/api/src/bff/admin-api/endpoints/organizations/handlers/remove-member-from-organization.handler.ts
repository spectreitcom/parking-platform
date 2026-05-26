import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';
import { RemoveMemberFromOrganizationQueryParamsDto } from '../dto/remove-member-from-organization-query-params.dto';

@Injectable()
export class RemoveMemberFromOrganizationHandler implements IControllerHandler {
  constructor(private readonly organizationFacade: OrganizationFacade) {}

  async handle(
    organizationId: string,
    memberId: string,
    queryParams: RemoveMemberFromOrganizationQueryParamsDto,
  ) {
    const id = await this.organizationFacade.removeMember(
      organizationId,
      memberId,
      queryParams.version,
    );
    return { id };
  }
}
