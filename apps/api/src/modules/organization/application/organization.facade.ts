import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrganizationCommand } from './commands/create-organization.command';
import { UpdateOrganizationCommand } from './commands/update-organization.command';
import { AddMemberCommand } from './commands/add-member.command';
import { RemoveMemberCommand } from './commands/remove-member.command';
import { GetOrganizationListForAdminQuery } from './queries/get-organization-list-for-admin.query';
import { OrganizationListForAdminItemReadModel } from './query-handlers/read-models/organization-list-for-admin-item.read-model';
import { GetOrganizationListForAdminTotalQuery } from './queries/get-organization-list-for-admin-total.query';
import { GetOrganizationByIdForAdminQuery } from './queries/get-organization-by-id-for-admin.query';
import { SearchOrganizationUsersQuery } from './queries/search-organization-users.query';
import { SearchedOrganizationUserItemReadModel } from './query-handlers/read-models/searched-organization-user-item.read-model';
import { GetOrganizationMembersByOrganizationUserIdQuery } from './queries/get-organization-members-by-organization-userId.query';
import { GetOrganizationMembersByOrganizationUserIdQueryResponse } from './query-handlers/get-organization-members-by-organization-userId.query-handler';

@Injectable()
export class OrganizationFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  async createOrganization(name: string, address: string, taxId: string) {
    const command = new CreateOrganizationCommand(name, address, taxId);
    return await this.commandBus.execute<CreateOrganizationCommand, string>(
      command,
    );
  }

  async updateOrganization(
    id: string,
    name: string,
    address: string,
    taxId: string,
    version: number,
  ) {
    const command = new UpdateOrganizationCommand(
      id,
      name,
      address,
      taxId,
      version,
    );
    return await this.commandBus.execute<UpdateOrganizationCommand, string>(
      command,
    );
  }

  async addMember(
    organizationId: string,
    organizationUserId: string,
    isRoot: boolean,
    version: number,
  ) {
    const command = new AddMemberCommand(
      organizationId,
      isRoot,
      organizationUserId,
      version,
    );
    return await this.commandBus.execute<AddMemberCommand, string>(command);
  }

  async removeMember(
    organizationId: string,
    memberId: string,
    version: number,
  ) {
    const command = new RemoveMemberCommand(organizationId, memberId, version);
    return await this.commandBus.execute<RemoveMemberCommand, string>(command);
  }

  async getOrganizationListForAdmin(
    page: number,
    limit: number,
    search?: string,
  ) {
    const query = new GetOrganizationListForAdminQuery(page, limit, search);
    return await this.queryBus.execute<
      GetOrganizationListForAdminQuery,
      OrganizationListForAdminItemReadModel[]
    >(query);
  }

  async getOrganizationListForAdminTotal(search?: string) {
    const query = new GetOrganizationListForAdminTotalQuery(search);
    return await this.queryBus.execute<
      GetOrganizationListForAdminTotalQuery,
      number
    >(query);
  }

  async getOrganizationByIdForAdmin(organizationId: string) {
    const query = new GetOrganizationByIdForAdminQuery(organizationId);
    return await this.queryBus.execute<
      GetOrganizationByIdForAdminQuery,
      OrganizationListForAdminItemReadModel
    >(query);
  }

  async searchOrganizationUsers(search?: string) {
    const query = new SearchOrganizationUsersQuery(search);
    return await this.queryBus.execute<
      SearchOrganizationUsersQuery,
      SearchedOrganizationUserItemReadModel[]
    >(query);
  }

  async getOrganizationMembersByOrganizationUserId(organizationUserId: string) {
    const query = new GetOrganizationMembersByOrganizationUserIdQuery(
      organizationUserId,
    );
    return await this.queryBus.execute<
      GetOrganizationMembersByOrganizationUserIdQuery,
      GetOrganizationMembersByOrganizationUserIdQueryResponse
    >(query);
  }
}
