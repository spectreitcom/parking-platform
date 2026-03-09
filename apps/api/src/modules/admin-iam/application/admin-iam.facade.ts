import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SignInCommand } from './commands/sign-in.command';
import { SignInCommandResponse } from './command-handlers/sign-in.command-handler';
import { SignOutCommand } from './commands/sign-out.command';
import { ActivateAdminUserCommand } from './commands/activate-admin-user.command';
import { SuspendAdminUserCommand } from './commands/suspend-admin-user.command';
import { GetAdminUsersListQuery } from './queries/get-admin-users-list.query';
import { AdminUsersListItemReadModel } from './queries/read-models/admin-users-list-item.read-model';

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
    return await this.commandBus.execute<
      GetAdminUsersListQuery,
      AdminUsersListItemReadModel[]
    >(query);
  }
}
