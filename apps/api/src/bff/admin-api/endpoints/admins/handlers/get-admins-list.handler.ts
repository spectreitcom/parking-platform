import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { GetAdminsListQueryParamsDto } from '../dto/get-admins-list-query-params.dto';
import { DEFAULT_PAGE_SIZE } from 'src/bff/admin-api/constants';

@Injectable()
export class GetAdminsListHandler implements IControllerHandler {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

  async handle(queryParams: GetAdminsListQueryParamsDto) {
    const data = await this.adminIamFacade.getAdminUsersList(
      queryParams.page ?? 1,
      queryParams.limit ?? DEFAULT_PAGE_SIZE,
      queryParams.search,
    );
    const total = await this.adminIamFacade.getAdminUsersTotal(
      queryParams.search,
    );
    return { data, total, currentPage: queryParams.page ?? 1 };
  }
}
