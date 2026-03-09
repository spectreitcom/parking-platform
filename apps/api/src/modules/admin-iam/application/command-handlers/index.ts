import { SignInCommandHandler } from './sign-in.command-handler';
import { SignOutCommandHandler } from './sign-out.command-handler';
import { ActivateAdminUserCommandHandler } from './activate-admin-user.command-handler';
import { SuspendAdminUserCommandHandler } from './suspend-admin-user.command-handler';
import { RequestResetPasswordCommandHandler } from './request-reset-password.command-handler';

export const commandHandlers = [
  SignInCommandHandler,
  SignOutCommandHandler,
  ActivateAdminUserCommandHandler,
  SuspendAdminUserCommandHandler,
  RequestResetPasswordCommandHandler,
];
