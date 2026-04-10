import { GetUserByIdQueryHandler } from './get-user-by-id.query-handler';
import { GetUsersListQueryHandler } from './get-users-list.query-handler';
import { GetUsersTotalQueryHandler } from './get-users-total.query-handler';
import { ValidateResetPasswordTokenQueryHandler } from './validate-reset-password-token.query-handler';
import { ValidateUserQueryHandler } from './validate-user.query-handler';

export const queryHandlers = [
  GetUserByIdQueryHandler,
  GetUsersListQueryHandler,
  GetUsersTotalQueryHandler,
  ValidateResetPasswordTokenQueryHandler,
  ValidateUserQueryHandler,
];
