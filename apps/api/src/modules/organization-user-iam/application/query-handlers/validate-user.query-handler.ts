import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ValidateUserQuery } from '../queries/validate-user.query';
import { OrganizationUserReadModel } from './read-models/organization-user.read-model';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { PasswordService } from '../ports/password.service';
import { OrganizationUserStatusMapperService } from '../ports/organization-user-status-mapper.service';
import { ORGANIZATION_USER_ACTIVE } from '../../domain/constants';
import { AppError } from 'src/shared/errors';

@QueryHandler(ValidateUserQuery)
export class ValidateUserQueryHandler implements IQueryHandler<
  ValidateUserQuery,
  OrganizationUserReadModel
> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly organizationUserStatusMapperService: OrganizationUserStatusMapperService,
  ) {}

  async execute(query: ValidateUserQuery): Promise<OrganizationUserReadModel> {
    const { email, password } = query;

    const record = await this.prismaService.organizationUser.findUnique({
      where: { email },
    });

    if (!record || record.status !== ORGANIZATION_USER_ACTIVE) {
      throw new AppError('UNAUTHORIZED', 'Unauthorized');
    }

    const isPasswordValid = await this.passwordService.compare(
      record.passwordHash ?? '',
      password,
    );

    if (!isPasswordValid) {
      throw new AppError('UNAUTHORIZED', 'Unauthorized');
    }

    return new OrganizationUserReadModel(
      record.id,
      record.displayName,
      record.email,
      this.organizationUserStatusMapperService.toText(record.status),
    );
  }
}
