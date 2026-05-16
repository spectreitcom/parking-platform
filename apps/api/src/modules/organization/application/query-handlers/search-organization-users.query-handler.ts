import { SearchOrganizationUsersQuery } from '../queries/search-organization-users.query';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchedOrganizationUserItemReadModel } from './read-models/searched-organization-user-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

@QueryHandler(SearchOrganizationUsersQuery)
export class SearchOrganizationUsersQueryHandler implements IQueryHandler<
  SearchOrganizationUsersQuery,
  SearchedOrganizationUserItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: SearchOrganizationUsersQuery,
  ): Promise<SearchedOrganizationUserItemReadModel[]> {
    const { search } = query;

    const users =
      await this.prismaService.organizationOrganizationUser.findMany({
        where: search
          ? {
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
            }
          : {},
        take: DEFAULT_PAGE_SIZE,
      });

    return users.map(
      (user) =>
        new SearchedOrganizationUserItemReadModel(
          user.organizationUserId,
          user.email,
          user.displayName,
        ),
    );
  }
}
