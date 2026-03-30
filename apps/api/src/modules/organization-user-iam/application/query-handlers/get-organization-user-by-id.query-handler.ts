import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationUserByIdQuery } from '../queries/get-organization-user-by-id.query';
import { OrganizationUserListItemReadModel } from 'src/modules/organization-user-iam/application/query-handlers/read-models/organization-user-list-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetOrganizationUserByIdQuery)
export class GetOrganizationUserByIdQueryHandler implements IQueryHandler<
  GetOrganizationUserByIdQuery,
  OrganizationUserListItemReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetOrganizationUserByIdQuery,
  ): Promise<OrganizationUserListItemReadModel> {
    const { organizationUserId } = query;

    const organizationUser =
      await this.prismaService.organizationUserRead.findUnique({
        where: { organizationUserId },
      });

    if (!organizationUser) {
      throw new AppError('ENTITY_NOT_FOUND', 'Organization user not found');
    }

    return new OrganizationUserListItemReadModel(
      organizationUser.organizationUserId,
      organizationUser.email,
      organizationUser.displayName,
      organizationUser.statusText,
    );
  }
}
