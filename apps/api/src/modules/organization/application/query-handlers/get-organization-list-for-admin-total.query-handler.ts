import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrganizationListForAdminTotalQuery } from '../queries/get-organization-list-for-admin-total.query';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { getOrganizationListForAdminQueryWhere } from './get-organization-list-for-admin.query-handler';

@QueryHandler(GetOrganizationListForAdminTotalQuery)
export class GetOrganizationListForAdminTotalQueryHandler implements IQueryHandler<
  GetOrganizationListForAdminTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetOrganizationListForAdminTotalQuery): Promise<number> {
    const { search } = query;

    return this.prismaService.organizationListForAdminRead.count({
      where: getOrganizationListForAdminQueryWhere(search),
    });
  }
}
