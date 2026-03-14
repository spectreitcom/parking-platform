import { GetAdminUsersTotalQueryHandler } from './get-admin-users-total.query-handler';
import { GetAdminUsersListQueryHandler } from './get-admin-users-list.query-handler';
import { ValidateResetPasswordTokenQueryHandler } from './validate-reset-password-token.query-handler';
import { ValidateUserQueryHandler } from './validate-user.query-handler';

export const queryHandlers = [
  GetAdminUsersTotalQueryHandler,
  GetAdminUsersListQueryHandler,
  ValidateResetPasswordTokenQueryHandler,
  ValidateUserQueryHandler,
];
