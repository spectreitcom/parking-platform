import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ValidateUserQuery } from '../queries/validate-user.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { PasswordService } from '../ports/password.service';
import { ADMIN_ACTIVE } from '../../domain/constants';
import { AppError } from 'src/shared/errors';
import { AdminUserDetailsReadModel } from 'src/modules/admin-iam/application/query-handlers/read-models/admin-user-details.read-model';

@QueryHandler(ValidateUserQuery)
export class ValidateUserQueryHandler implements IQueryHandler<
  ValidateUserQuery,
  AdminUserDetailsReadModel
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(query: ValidateUserQuery): Promise<AdminUserDetailsReadModel> {
    const { email, password } = query;

    const record = await this.prismaService.adminUser.findUnique({
      where: { email, status: ADMIN_ACTIVE },
    });

    if (!record) throw new AppError('UNAUTHORIZED', 'Unauthorized');

    const isPasswordValid = await this.passwordService.compare(
      record?.passwordHash ?? '',
      password,
    );

    if (!isPasswordValid) throw new AppError('UNAUTHORIZED', 'Unauthorized');

    return {
      id: record.id,
      isSuperAdmin: record.isSuperAdmin,
      email: record.email,
      displayName: record.displayName,
    };
  }
}
