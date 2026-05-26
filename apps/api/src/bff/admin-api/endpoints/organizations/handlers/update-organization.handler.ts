import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

@Injectable()
export class UpdateOrganizationHandler implements IControllerHandler {
  constructor(private readonly organizationFacade: OrganizationFacade) {}

  async handle(organizationId: string, dto: UpdateOrganizationDto) {
    const id = await this.organizationFacade.updateOrganization(
      organizationId,
      dto.name,
      dto.address,
      dto.taxId,
      dto.version,
    );
    return { id };
  }
}
