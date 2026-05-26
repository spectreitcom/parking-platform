import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';

@Injectable()
export class GetOrganizationByIdHandler implements IControllerHandler {
  constructor(private readonly organizationFacade: OrganizationFacade) {}

  async handle(organizationId: string) {
    return await this.organizationFacade.getOrganizationByIdForAdmin(
      organizationId,
    );
  }
}
