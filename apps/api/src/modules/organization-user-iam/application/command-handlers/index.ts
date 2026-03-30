import { UpdateOrganizationUserCommandHandler } from './update-organization-user.command-handler';
import { ActivateOrganizationUserCommandHandler } from './activate-organization-user.command-handler';
import { SuspendOrganizationUserCommandHandler } from './suspend-organization-user.command-handler';
import { InviteOrganizationUserCommandHandler } from './invite-organization-user.command-handler';
import { ChangeOrganizationUserPasswordCommandHandler } from './change-organization-user-password.command-handler';
import { RequestResetPasswordCommandHandler } from './request-reset-password.command-handler';
import { GenerateResetPasswordTokenCommandHandler } from './generate-reset-password-token.command-handler';
import { ResetPasswordCommandHandler } from './reset-password.command-handler';
import { SignInCommandHandler } from './sign-in.command-handler';
import { SignOutCommandHandler } from './sign-out.command-handler';

export const commandHandlers = [
  UpdateOrganizationUserCommandHandler,
  ActivateOrganizationUserCommandHandler,
  SuspendOrganizationUserCommandHandler,
  InviteOrganizationUserCommandHandler,
  ChangeOrganizationUserPasswordCommandHandler,
  RequestResetPasswordCommandHandler,
  GenerateResetPasswordTokenCommandHandler,
  ResetPasswordCommandHandler,
  SignInCommandHandler,
  SignOutCommandHandler,
];
