import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdminUsersTotalQuery } from '../queries/get-admin-users-total.query';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { getAdminUsersListQueryWhere } from './get-admin-users-list.query-handler';

@QueryHandler(GetAdminUsersTotalQuery)
export class GetAdminUsersTotalQueryHandler implements IQueryHandler<
  GetAdminUsersTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetAdminUsersTotalQuery): Promise<number> {
    const { search } = query;

    return this.prismaService.adminUserRead.count({
      where: getAdminUsersListQueryWhere(search),
    });
  }
}
