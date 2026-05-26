import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';
import { SearchOrganizationUsersQueryParamsDto } from '../dto/search-organization-users-query-params.dto';

@Injectable()
export class SearchOrganizationUsersHandler implements IControllerHandler {
  constructor(private readonly organizationFacade: OrganizationFacade) {}

  async handle(queryParams: SearchOrganizationUsersQueryParamsDto) {
    return await this.organizationFacade.searchOrganizationUsers(
      queryParams.search,
    );
  }
}
