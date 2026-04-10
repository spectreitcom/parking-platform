import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersTotalQuery } from '../queries/get-users-total.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { getUsersListQueryWhere } from './get-users-list.query-handler';

@QueryHandler(GetUsersTotalQuery)
export class GetUsersTotalQueryHandler implements IQueryHandler<
  GetUsersTotalQuery,
  number
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetUsersTotalQuery): Promise<number> {
    const { search } = query;

    return this.prismaService.userRead.count({
      where: getUsersListQueryWhere(search),
    });
  }
}
