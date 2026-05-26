import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';
import { GetOrganizationListQueryParamsDto } from '../dto/get-organization-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/bff/admin-api/constants';

@Injectable()
export class GetOrganizationListHandler implements IControllerHandler {
  constructor(private readonly organizationFacade: OrganizationFacade) {}

  async handle(queryParams: GetOrganizationListQueryParamsDto) {
    const data = await this.organizationFacade.getOrganizationListForAdmin(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );
    const total =
      await this.organizationFacade.getOrganizationListForAdminTotal(
        queryParams.search,
      );

    return { data, total, currentPage: queryParams.page ?? 1 };
  }
}
