import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignInCommand } from './commands/sign-in.command';
import { SignInCommandResponse } from './command-handlers/sign-in.command-handler';
import { SignOutCommand } from './commands/sign-out.command';
import { ActivateAdminUserCommand } from './commands/activate-admin-user.command';
import { SuspendAdminUserCommand } from './commands/suspend-admin-user.command';
import { GetAdminUsersListQuery } from './queries/get-admin-users-list.query';
import { AdminUsersListItemReadModel } from './query-handlers/read-models/admin-users-list-item.read-model';
import { GetAdminUsersTotalQuery } from './queries/get-admin-users-total.query';
import { RequestResetPasswordCommand } from './commands/request-reset-password.command';
import { ResetPasswordCommand } from './commands/reset-password.command';
import { ValidateResetPasswordTokenQuery } from './queries/validate-reset-password-token.query';
import { InviteAdminUserCommand } from './commands/invite-admin-user.command';
import { GenerateResetPasswordTokenCommand } from './commands/generate-reset-password-token.command';
import { ValidateUserQuery } from './queries/validate-user.query';
import { GetAdminUserByIdQuery } from './queries/get-admin-user-by-id.query';
import { ChangePasswordCommand } from './commands/change-password.command';
import { RefreshTokenCommand } from './commands/refresh-token.command';
import { AdminUserDetailsReadModel } from './query-handlers/read-models/admin-user-details.read-model';

@Injectable()
export class AdminIamFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async signIn(adminUserId: string) {
    const command = new SignInCommand(adminUserId);
    return await this.commandBus.execute<SignInCommand, SignInCommandResponse>(
      command,
    );
  }

  async signOut(adminUserId: string) {
    return await this.commandBus.execute<SignOutCommand, void>(
      new SignOutCommand(adminUserId),
    );
  }

  async activateAdminUser(adminUserId: string, version: number) {
    return await this.commandBus.execute<ActivateAdminUserCommand, void>(
      new ActivateAdminUserCommand(adminUserId, version),
    );
  }

  async suspendAdminUser(adminUserId: string, version: number) {
    return await this.commandBus.execute<SuspendAdminUserCommand, void>(
      new SuspendAdminUserCommand(adminUserId, version),
    );
  }

  async getAdminUsersList(page: number, limit: number, search?: string) {
    const query = new GetAdminUsersListQuery(page, limit, search);
    return await this.queryBus.execute<
      GetAdminUsersListQuery,
      AdminUsersListItemReadModel[]
    >(query);
  }

  async getAdminUsersTotal(search?: string) {
    const query = new GetAdminUsersTotalQuery(search);
    return await this.queryBus.execute<GetAdminUsersTotalQuery, number>(query);
  }

  async requestResetPassword(email: string) {
    return await this.commandBus.execute<RequestResetPasswordCommand, void>(
      new RequestResetPasswordCommand(email),
    );
  }

  async resetPassword(resetPasswordToken: string, password: string) {
    return await this.commandBus.execute<ResetPasswordCommand, void>(
      new ResetPasswordCommand(resetPasswordToken, password),
    );
  }

  async validateResetPasswordToken(resetPasswordToken: string) {
    return await this.queryBus.execute<
      ValidateResetPasswordTokenQuery,
      boolean
    >(new ValidateResetPasswordTokenQuery(resetPasswordToken));
  }

  async inviteAdminUser(email: string, displayName: string) {
    const command = new InviteAdminUserCommand(email, displayName);
    return await this.commandBus.execute<InviteAdminUserCommand, string>(
      command,
    );
  }

  async generateResetPasswordToken(adminUserId: string) {
    const command = new GenerateResetPasswordTokenCommand(adminUserId);
    return await this.commandBus.execute<
      GenerateResetPasswordTokenCommand,
      string
    >(command);
  }

  async validateUser(email: string, password: string) {
    return await this.queryBus.execute<
      ValidateUserQuery,
      AdminUserDetailsReadModel
    >(new ValidateUserQuery(email, password));
  }

  async getAdminUserById(adminUserId: string) {
    const query = new GetAdminUserByIdQuery(adminUserId);
    return await this.queryBus.execute<
      GetAdminUserByIdQuery,
      AdminUserDetailsReadModel
    >(query);
  }

  async changePassword(
    adminUserId: string,
    existingPassword: string,
    newPassword: string,
  ) {
    return await this.commandBus.execute<ChangePasswordCommand, void>(
      new ChangePasswordCommand(adminUserId, existingPassword, newPassword),
    );
  }

  async refreshToken(refreshToken: string) {
    const command = new RefreshTokenCommand(refreshToken);
    return await this.commandBus.execute<
      RefreshTokenCommand,
      SignInCommandResponse
    >(command);
  }
}
