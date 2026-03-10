import { SignInCommandHandler } from './sign-in.command-handler';
import { SignOutCommandHandler } from './sign-out.command-handler';
import { ActivateAdminUserCommandHandler } from './activate-admin-user.command-handler';
import { SuspendAdminUserCommandHandler } from './suspend-admin-user.command-handler';
import { RequestResetPasswordCommandHandler } from './request-reset-password.command-handler';
import { ResetPasswordCommandHandler } from './reset-password.command-handler';
import { InviteAdminUserCommandHandler } from './invite-admin-user.command-handler';

export const commandHandlers = [
  SignInCommandHandler,
  SignOutCommandHandler,
  ActivateAdminUserCommandHandler,
  SuspendAdminUserCommandHandler,
  RequestResetPasswordCommandHandler,
  ResetPasswordCommandHandler,
  InviteAdminUserCommandHandler,
];
