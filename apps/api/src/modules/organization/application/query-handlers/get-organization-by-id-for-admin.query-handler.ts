import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationByIdForAdminQuery } from '../queries/get-organization-by-id-for-admin.query';
import { OrganizationListForAdminItemReadModel } from './read-models/organization-list-for-admin-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetOrganizationByIdForAdminQuery)
export class GetOrganizationByIdForAdminQueryHandler implements IQueryHandler<
  GetOrganizationByIdForAdminQuery,
  OrganizationListForAdminItemReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetOrganizationByIdForAdminQuery,
  ): Promise<OrganizationListForAdminItemReadModel> {
    const { organizationId } = query;

    const record =
      await this.prismaService.organizationListForAdminRead.findUnique({
        where: { organizationId },
      });

    if (!record) {
      throw new AppError('ENTITY_NOT_FOUND', 'Organization not found');
    }

    const members = record.members as {
      id: string;
      isRoot: boolean;
      organizationUserId: string;
    }[];

    const organizationUserIds = members.map((m) => m.organizationUserId);

    const organizationUsers =
      await this.prismaService.organizationUserRead.findMany({
        where: {
          organizationUserId: {
            in: organizationUserIds,
          },
        },
      });

    const _members: OrganizationListForAdminItemReadModel['members'] =
      members.map((member) => {
        const organizationUser = organizationUsers.find(
          (user) => user.organizationUserId === member.organizationUserId,
        );

        return {
          ...member,
          displayName: organizationUser?.displayName ?? '',
          email: organizationUser?.email ?? '',
        };
      });

    return new OrganizationListForAdminItemReadModel(
      record.organizationId,
      record.name,
      record.address,
      record.taxId,
      _members,
      record.version,
    );
  }
}
