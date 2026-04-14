import { AdminIamInvitedIEHandler } from './admin-iam-invited.ie-handler';
import { AdminIamRequestedResetPasswordTokenIeHandler } from './admin-iam-requested-reset-password-token.ie-handler';
import { OrganizationUserIamRequestedResetPasswordTokenIeHandler } from './organization-user-iam-requested-reset-password-token.ie-handler';
import { UserIamRequestedResetPasswordTokenIeHandler } from './user-iam-requested-reset-password-token.ie-handler';

export const ieHandlers = [
  AdminIamInvitedIEHandler,
  AdminIamRequestedResetPasswordTokenIeHandler,
  OrganizationUserIamRequestedResetPasswordTokenIeHandler,
  UserIamRequestedResetPasswordTokenIeHandler,
];
