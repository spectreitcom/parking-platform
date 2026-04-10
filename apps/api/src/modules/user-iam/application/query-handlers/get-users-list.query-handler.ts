import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersListQuery } from '../queries/get-users-list.query';
import { UsersListItemReadModel } from './read-models/users-list-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export const getUsersListQueryWhere: (
  search?: string,
) => Prisma.UserReadWhereInput = (search?: string) =>
  search
    ? {
        OR: [
          {
            name: {
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
    : {};

@QueryHandler(GetUsersListQuery)
export class GetUsersListQueryHandler implements IQueryHandler<
  GetUsersListQuery,
  UsersListItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetUsersListQuery): Promise<UsersListItemReadModel[]> {
    const { search, page, limit } = query;

    const records = await this.prismaService.userRead.findMany({
      where: getUsersListQueryWhere(search),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map(
      (record) =>
        new UsersListItemReadModel(
          record.userId,
          record.email,
          record.name,
          record.provider,
        ),
    );
  }
}
