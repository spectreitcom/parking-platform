import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationUsersListQuery } from '../queries/get-organization-users-list.query';
import { OrganizationUserListItemReadModel } from './read-models/organization-user-list-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const getOrganizationUsersListQueryWhere: (
  search?: string,
) => Prisma.OrganizationUserReadWhereInput = (search?: string) =>
  search
    ? {
        OR: [
          {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            displayName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }
    : {};

@QueryHandler(GetOrganizationUsersListQuery)
export class GetOrganizationUsersListQueryHandler implements IQueryHandler<
  GetOrganizationUsersListQuery,
  OrganizationUserListItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetOrganizationUsersListQuery,
  ): Promise<OrganizationUserListItemReadModel[]> {
    const { search } = query;

    const page = Math.max(1, Math.floor(query.page || 1));
    const limit = Math.min(100, Math.max(1, Math.floor(query.limit || 20)));

    const records = await this.prismaService.organizationUserRead.findMany({
      where: getOrganizationUsersListQueryWhere(search),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        displayName: 'asc',
      },
    });

    return records.map(
      (record) =>
        new OrganizationUserListItemReadModel(
          record.organizationUserId,
          record.email,
          record.displayName,
          record.statusText,
        ),
    );
  }
}
