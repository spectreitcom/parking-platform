import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAdminUserByIdQuery } from '../queries/get-admin-user-by-id.query';
import { AdminUserDetailsReadModel } from './read-models/admin-user-details.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppError } from 'src/shared/errors';

@QueryHandler(GetAdminUserByIdQuery)
export class GetAdminUserByIdQueryHandler implements IQueryHandler<
  GetAdminUserByIdQuery,
  AdminUserDetailsReadModel
> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    query: GetAdminUserByIdQuery,
  ): Promise<AdminUserDetailsReadModel> {
    const { adminUserId } = query;

    const record = await this.prismaService.adminUserRead.findUnique({
      where: { adminUserId },
    });

    if (!record) throw new AppError('ENTITY_NOT_FOUND', 'Admin user not found');

    return new AdminUserDetailsReadModel(
      record.adminUserId,
      record.email,
      record.displayName,
      record.isSuperAdmin,
    );
  }
}
