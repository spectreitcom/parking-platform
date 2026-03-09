import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdminUsersListQuery } from '../queries/get-admin-users-list.query';
import { AdminUsersListItemReadModel } from '../queries/read-models/admin-users-list-item.read-model';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AdminStatusMapperService } from '../ports/admin-status-mapper.service';
import { Prisma } from '@prisma/client';

export const getAdminUsersListQueryWhere: (
  search?: string,
) => Prisma.AdminUserReadWhereInput = (search?: string) => ({
  OR: [
    {
      displayName: {
        contains: search,
        mode: 'insensitive',
      },
    },
    {
      email: {
        contains: search,
        mode: 'insensitive',
      },
    },
  ],
});

@QueryHandler(GetAdminUsersListQuery)
export class GetAdminUsersListQueryHandler implements IQueryHandler<
  GetAdminUsersListQuery,
  AdminUsersListItemReadModel[]
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly adminStatusMapperService: AdminStatusMapperService,
  ) {}

  async execute(
    query: GetAdminUsersListQuery,
  ): Promise<AdminUsersListItemReadModel[]> {
    const { search, page, limit } = query;

    const records = await this.prismaService.adminUserRead.findMany({
      where: getAdminUsersListQueryWhere(search),
      skip: (page - 1) * limit,
      take: limit,
    });

    return records.map(
      (record) =>
        new AdminUsersListItemReadModel(
          record.id,
          record.email,
          record.displayName,
          this.adminStatusMapperService.toText(record.status),
        ),
    );
  }
}
