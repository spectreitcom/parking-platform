import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignInCommand } from './commands/sign-in.command';
import { SignInCommandResponse } from './command-handlers/sign-in.command-handler';
import { SignOutCommand } from './commands/sign-out.command';
import { RequestResetPasswordCommand } from './commands/request-reset-password.command';
import { ResetPasswordCommand } from './commands/reset-password.command';
import { GenerateResetPasswordTokenCommand } from './commands/generate-reset-password-token.command';
import { ChangePasswordCommand } from './commands/change-password.command';
import { RefreshTokenCommand } from './commands/refresh-token.command';
import { GetUsersListQuery } from './queries/get-users-list.query';
import { UsersListItemReadModel } from './query-handlers/read-models/users-list-item.read-model';
import { GetUsersTotalQuery } from './queries/get-users-total.query';
import { ValidateResetPasswordTokenQuery } from './queries/validate-reset-password-token.query';
import { ValidateUserQuery } from './queries/validate-user.query';
import { UserDetailsReadModel } from './query-handlers/read-models/user-details.read-model';
import { GetUserByIdQuery } from './queries/get-user-by-id.query';
import { RegisterUserCommand } from 'src/modules/user-iam/application/commands/register-user.command';

@Injectable()
export class UserIamFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async signIn(userId: string) {
    const command = new SignInCommand(userId);
    return await this.commandBus.execute<SignInCommand, SignInCommandResponse>(
      command,
    );
  }

  async signOut(refreshToken: string) {
    return await this.commandBus.execute<SignOutCommand, void>(
      new SignOutCommand(refreshToken),
    );
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

  async generateResetPasswordToken(userId: string) {
    const command = new GenerateResetPasswordTokenCommand(userId);
    return await this.commandBus.execute<
      GenerateResetPasswordTokenCommand,
      string
    >(command);
  }

  async changePassword(
    userId: string,
    existingPassword: string,
    newPassword: string,
  ) {
    return await this.commandBus.execute<ChangePasswordCommand, void>(
      new ChangePasswordCommand(userId, existingPassword, newPassword),
    );
  }

  async refreshToken(refreshToken: string) {
    const command = new RefreshTokenCommand(refreshToken);
    return await this.commandBus.execute<
      RefreshTokenCommand,
      SignInCommandResponse
    >(command);
  }

  async getUsersList(page: number, limit: number, search?: string) {
    const query = new GetUsersListQuery(page, limit, search);
    return await this.queryBus.execute<
      GetUsersListQuery,
      UsersListItemReadModel[]
    >(query);
  }

  async getUsersTotal(search?: string) {
    const query = new GetUsersTotalQuery(search);
    return await this.queryBus.execute<GetUsersTotalQuery, number>(query);
  }

  async validateResetPasswordToken(resetPasswordToken: string) {
    return await this.queryBus.execute<
      ValidateResetPasswordTokenQuery,
      boolean
    >(new ValidateResetPasswordTokenQuery(resetPasswordToken));
  }

  async validateUser(email: string, password: string) {
    return await this.queryBus.execute<ValidateUserQuery, UserDetailsReadModel>(
      new ValidateUserQuery(email, password),
    );
  }

  async getUserById(userId: string) {
    const query = new GetUserByIdQuery(userId);
    return await this.queryBus.execute<GetUserByIdQuery, UserDetailsReadModel>(
      query,
    );
  }

  async registerUser(email: string, name: string, password: string) {
    const command = new RegisterUserCommand(email, password, name);
    return await this.commandBus.execute<RegisterUserCommand, string>(command);
  }
}
