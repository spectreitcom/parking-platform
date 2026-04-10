import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ValidateUserQuery } from '../queries/validate-user.query';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { PasswordService } from '../ports/password.service';
import { AppError } from 'src/shared/errors';
import { UserDetailsReadModel } from './read-models/user-details.read-model';

@QueryHandler(ValidateUserQuery)
export class ValidateUserQueryHandler implements IQueryHandler<
  ValidateUserQuery,
  UserDetailsReadModel
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(query: ValidateUserQuery): Promise<UserDetailsReadModel> {
    const { email, password } = query;

    const record = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!record) throw new AppError('UNAUTHORIZED', 'Unauthorized');

    const isPasswordValid = await this.passwordService.compare(
      record?.passwordHash ?? '',
      password,
    );

    if (!isPasswordValid) throw new AppError('UNAUTHORIZED', 'Unauthorized');

    return new UserDetailsReadModel(
      record.id,
      record.email,
      record.name,
      record.provider,
    );
  }
}
