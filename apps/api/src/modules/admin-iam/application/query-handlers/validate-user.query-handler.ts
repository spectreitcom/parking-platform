import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ValidateUserQuery } from '../queries/validate-user.query';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { PasswordService } from '../ports/password.service';
import { ADMIN_ACTIVE } from '../../domain/constants';
import { AppError } from '../../../../shared/errors';

@QueryHandler(ValidateUserQuery)
export class ValidateUserQueryHandler implements IQueryHandler<
  ValidateUserQuery,
  string
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(query: ValidateUserQuery): Promise<string> {
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

    return record.id;
  }
}
