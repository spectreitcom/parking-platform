import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationByIdsQuery } from '../queries/get-organization-by-ids.query';
import { OrganizationReadModel } from './read-models/organization.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetOrganizationByIdsQuery)
export class GetOrganizationByIdsQueryHandler implements IQueryHandler<
  GetOrganizationByIdsQuery,
  OrganizationReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetOrganizationByIdsQuery,
  ): Promise<OrganizationReadModel[]> {
    const { ids } = query;

    const records =
      await this.prismaService.organizationListForAdminRead.findMany({
        where: {
          organizationId: {
            in: ids,
          },
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

    const result: OrganizationReadModel[] = [];

    for (const record of records) {
      const members = record.members as {
        id: string;
        isRoot: boolean;
        organizationUserId: string;
      }[];

      const _members: OrganizationReadModel['members'] = [];

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
        new OrganizationReadModel(
          record.organizationId,
          record.name,
          record.address,
          record.taxId,
          _members,
          record.version,
        ),
      );
    }

    return result;
  }
}
