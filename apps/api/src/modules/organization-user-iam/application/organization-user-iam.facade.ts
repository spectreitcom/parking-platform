import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrganizationUserCommand } from './commands/create-organization-user.command';
import { UpdateOrganizationUserCommand } from './commands/update-organization-user.command';
import { ActivateOrganizationUserCommand } from './commands/activate-organization-user.command';
import { SuspendOrganizationUserCommand } from './commands/suspend-organization-user.command';
import { InviteOrganizationUserCommand } from './commands/invite-organization-user.command';
import { ChangeOrganizationUserPasswordCommand } from './commands/change-organization-user-password.command';
import { RequestResetPasswordCommand } from './commands/request-reset-password.command';
import { ResetPasswordCommand } from './commands/reset-password.command';
import { ValidateResetPasswordTokenQuery } from './queries/validate-reset-password-token.query';
import { GenerateResetPasswordTokenCommand } from './commands/generate-reset-password-token.command';
import { GetOrganizationUsersListQuery } from './queries/get-organization-users-list.query';
import { GetOrganizationUsersTotalQuery } from './queries/get-organization-users-total.query';
import { OrganizationUserListItemReadModel } from './query-handlers/read-models/organization-user-list-item.read-model';

@Injectable()
export class OrganizationUserIamFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createOrganizationUser(
    email: string,
    displayName: string,
    passwordHash?: string,
  ): Promise<string> {
    const command = new CreateOrganizationUserCommand(
      email,
      displayName,
      passwordHash,
    );
    return await this.commandBus.execute<CreateOrganizationUserCommand, string>(
      command,
    );
  }

  async updateOrganizationUser(
    organizationUserId: string,
    displayName: string,
    version: number,
  ): Promise<void> {
    const command = new UpdateOrganizationUserCommand(
      organizationUserId,
      displayName,
      version,
    );
    return await this.commandBus.execute<UpdateOrganizationUserCommand, void>(
      command,
    );
  }

  async activateOrganizationUser(
    organizationUserId: string,
    version: number,
  ): Promise<void> {
    const command = new ActivateOrganizationUserCommand(
      organizationUserId,
      version,
    );
    return await this.commandBus.execute<ActivateOrganizationUserCommand, void>(
      command,
    );
  }

  async suspendOrganizationUser(
    organizationUserId: string,
    version: number,
  ): Promise<void> {
    const command = new SuspendOrganizationUserCommand(
      organizationUserId,
      version,
    );
    return await this.commandBus.execute<SuspendOrganizationUserCommand, void>(
      command,
    );
  }

  async inviteOrganizationUser(
    email: string,
    displayName: string,
  ): Promise<void> {
    const command = new InviteOrganizationUserCommand(email, displayName);
    return await this.commandBus.execute<InviteOrganizationUserCommand, void>(
      command,
    );
  }

  async changeOrganizationUserPassword(
    organizationUserId: string,
    passwordHash: string,
    version: number,
  ): Promise<void> {
    const command = new ChangeOrganizationUserPasswordCommand(
      organizationUserId,
      passwordHash,
      version,
    );
    return await this.commandBus.execute<
      ChangeOrganizationUserPasswordCommand,
      void
    >(command);
  }

  async requestResetPassword(email: string): Promise<void> {
    const command = new RequestResetPasswordCommand(email);
    return await this.commandBus.execute<RequestResetPasswordCommand, void>(
      command,
    );
  }

  async resetPassword(
    resetPasswordToken: string,
    password: string,
  ): Promise<void> {
    const command = new ResetPasswordCommand(resetPasswordToken, password);
    return await this.commandBus.execute<ResetPasswordCommand, void>(command);
  }

  async validateResetPasswordToken(
    resetPasswordToken: string,
  ): Promise<boolean> {
    const query = new ValidateResetPasswordTokenQuery(resetPasswordToken);
    return await this.queryBus.execute<
      ValidateResetPasswordTokenQuery,
      boolean
    >(query);
  }

  async generateResetPasswordToken(
    organizationUserId: string,
  ): Promise<string> {
    const command = new GenerateResetPasswordTokenCommand(organizationUserId);
    return await this.commandBus.execute<
      GenerateResetPasswordTokenCommand,
      string
    >(command);
  }

  async getOrganizationUsersList(
    page: number,
    limit: number,
    search?: string,
  ): Promise<OrganizationUserListItemReadModel[]> {
    const query = new GetOrganizationUsersListQuery(page, limit, search);
    return await this.queryBus.execute<
      GetOrganizationUsersListQuery,
      OrganizationUserListItemReadModel[]
    >(query);
  }

  async getOrganizationUsersTotal(search?: string): Promise<number> {
    const query = new GetOrganizationUsersTotalQuery(search);
    return await this.queryBus.execute<GetOrganizationUsersTotalQuery, number>(
      query,
    );
  }
}
