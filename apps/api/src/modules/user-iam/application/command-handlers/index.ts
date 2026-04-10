import { SignInCommandHandler } from './sign-in.command-handler';
import { SignOutCommandHandler } from './sign-out.command-handler';
import { RequestResetPasswordCommandHandler } from './request-reset-password.command-handler';
import { ResetPasswordCommandHandler } from './reset-password.command-handler';
import { GenerateResetPasswordTokenCommandHandler } from './generate-reset-password-token.command-handler';
import { ChangePasswordCommandHandler } from './change-password.command-handler';
import { RefreshTokenCommandHandler } from './refresh-token.command-handler';

export const commandHandlers = [
  SignInCommandHandler,
  SignOutCommandHandler,
  RequestResetPasswordCommandHandler,
  ResetPasswordCommandHandler,
  GenerateResetPasswordTokenCommandHandler,
  ChangePasswordCommandHandler,
  RefreshTokenCommandHandler,
];
