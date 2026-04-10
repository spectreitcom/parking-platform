import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';
import { UserDetailsReadModel } from './read-models/user-details.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<
  GetUserByIdQuery,
  UserDetailsReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetUserByIdQuery): Promise<UserDetailsReadModel> {
    const { userId } = query;

    const record = await this.prismaService.userRead.findUnique({
      where: { userId },
    });

    if (!record) throw new AppError('ENTITY_NOT_FOUND', 'User not found');

    return new UserDetailsReadModel(
      record.userId,
      record.email,
      record.name,
      record.provider,
    );
  }
}
