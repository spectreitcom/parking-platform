import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';
import { CreateOrganizationDto } from '../dto/create-organization.dto';

@Injectable()
export class CreateOrganizationHandler implements IControllerHandler {
  constructor(private readonly organizationFacade: OrganizationFacade) {}

  async handle(dto: CreateOrganizationDto) {
    const id = await this.organizationFacade.createOrganization(
      dto.name,
      dto.address,
      dto.taxId,
    );
    return { id };
  }
}
