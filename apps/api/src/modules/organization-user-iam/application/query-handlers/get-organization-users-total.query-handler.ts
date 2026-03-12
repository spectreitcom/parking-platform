import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationUsersTotalQuery } from '../queries/get-organization-users-total.query';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { getOrganizationUsersListQueryWhere } from './get-organization-users-list.query-handler';

@QueryHandler(GetOrganizationUsersTotalQuery)
export class GetOrganizationUsersTotalQueryHandler implements IQueryHandler<
  GetOrganizationUsersTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetOrganizationUsersTotalQuery): Promise<number> {
    const { search } = query;

    return await this.prismaService.organizationUserRead.count({
      where: getOrganizationUsersListQueryWhere(search),
    });
  }
}
