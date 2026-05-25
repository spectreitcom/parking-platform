import { GetOrganizationListForAdminQueryHandler } from './get-organization-list-for-admin.query-handler';
import { GetOrganizationListForAdminTotalQueryHandler } from './get-organization-list-for-admin-total.query-handler';
import { GetOrganizationByIdForAdminQueryHandler } from './get-organization-by-id-for-admin.query-handler';
import { SearchOrganizationUsersQueryHandler } from './search-organization-users.query-handler';
import { GetOrganizationMembersByOrganizationUserIdQueryHandler } from './get-organization-members-by-organization-userId.query-handler';

export const queryHandlers = [
  GetOrganizationListForAdminQueryHandler,
  GetOrganizationListForAdminTotalQueryHandler,
  GetOrganizationByIdForAdminQueryHandler,
  SearchOrganizationUsersQueryHandler,
  GetOrganizationMembersByOrganizationUserIdQueryHandler,
];
