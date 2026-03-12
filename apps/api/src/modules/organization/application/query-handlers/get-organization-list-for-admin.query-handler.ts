import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationListForAdminQuery } from '../queries/get-organization-list-for-admin.query';
import { OrganizationListForAdminItemReadModel } from './read-models/organization-list-for-admin-item.read-model';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const getOrganizationListForAdminQueryWhere: (
  search?: string,
) => Prisma.OrganizationListForAdmnReadWhereInput = (search?: string) => ({
  OR: [
    {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    },
    {
      address: {
        contains: search,
        mode: 'insensitive',
      },
    },
    {
      taxId: {
        contains: search,
        mode: 'insensitive',
      },
    },
  ],
});

@QueryHandler(GetOrganizationListForAdminQuery)
export class GetOrganizationListForAdminQueryHandler implements IQueryHandler<
  GetOrganizationListForAdminQuery,
  OrganizationListForAdminItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetOrganizationListForAdminQuery,
  ): Promise<OrganizationListForAdminItemReadModel[]> {
    const { page, limit, search } = query;

    const records =
      await this.prismaService.organizationListForAdmnRead.findMany({
        where: getOrganizationListForAdminQueryWhere(search),
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          id: 'asc',
        },
      });

    const organizationUserIds: string[] = [];

    for (const record of records) {
      const members = record.members as {
        id: string;
        isRoot: boolean;
        organizationUserId: string;
      }[];

      for (const member of members) {
        organizationUserIds.push(member.organizationUserId);
      }
    }

    const organizationUsers =
      await this.prismaService.organizationOrganizationUser.findMany({
        where: {
          organizationUserId: {
            in: organizationUserIds,
          },
        },
      });

    const result: OrganizationListForAdminItemReadModel[] = [];

    for (const record of records) {
      const members = record.members as {
        id: string;
        isRoot: boolean;
        organizationUserId: string;
      }[];

      const _members: OrganizationListForAdminItemReadModel['members'] = [];

      for (const member of members) {
        const organizationUser = organizationUsers.find(
          (user) => user.organizationUserId === member.organizationUserId,
        );

        _members.push({
          ...member,
          displayName: organizationUser?.displayName ?? '',
          email: organizationUser?.email ?? '',
        });
      }

      result.push(
        new OrganizationListForAdminItemReadModel(
          record.organizationId,
          record.name,
          record.address,
          record.taxId,
          _members,
        ),
      );
    }

    return result;
  }
}
