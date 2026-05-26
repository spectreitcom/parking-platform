import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';
import { AddMemberToOrganizationDto } from '../dto/add-member-to-organization.dto';

@Injectable()
export class AddMemberToOrganizationHandler implements IControllerHandler {
  constructor(private readonly organizationFacade: OrganizationFacade) {}

  async handle(organizationId: string, dto: AddMemberToOrganizationDto) {
    const id = await this.organizationFacade.addMember(
      organizationId,
      dto.organizationUserId,
      dto.isRoot,
      dto.version,
    );
    return { id };
  }
}
