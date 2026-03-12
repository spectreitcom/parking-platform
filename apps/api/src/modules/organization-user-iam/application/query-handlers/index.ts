import { ValidateResetPasswordTokenQueryHandler } from './validate-reset-password-token.query-handler';
import { GetOrganizationUsersListQueryHandler } from './get-organization-users-list.query-handler';
import { GetOrganizationUsersTotalQueryHandler } from './get-organization-users-total.query-handler';

export const queryHandlers = [
  ValidateResetPasswordTokenQueryHandler,
  GetOrganizationUsersListQueryHandler,
  GetOrganizationUsersTotalQueryHandler,
];
