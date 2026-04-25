import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersByIdsQuery } from '../queries/get-users-by-ids.query';
import { UsersListItemReadModel } from './read-models/users-list-item.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@QueryHandler(GetUsersByIdsQuery)
export class GetUsersByIdsQueryHandler implements IQueryHandler<
  GetUsersByIdsQuery,
  UsersListItemReadModel[]
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetUsersByIdsQuery): Promise<UsersListItemReadModel[]> {
    const { userIds } = query;

    const records = await this.prismaService.userRead.findMany({
      where: {
        userId: {
          in: userIds,
        },
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
