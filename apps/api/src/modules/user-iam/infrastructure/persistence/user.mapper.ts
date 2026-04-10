import { User as UserModel } from '@prisma/client';
import { User } from 'src/modules/user-iam/domain/user';
import { UserId } from 'src/modules/user-iam/domain/value-objects/user-id';
import { Email } from 'src/shared/value-objects/email';
import { UserName } from 'src/modules/user-iam/domain/value-objects/user-name';
import { LoginProvider } from 'src/modules/user-iam/domain/value-objects/login-provider';

export class UserMapper {
  static toDomain(raw: UserModel) {
    return User.reconstruct(
      UserId.fromString(raw.id),
      Email.fromString(raw.email),
      UserName.fromString(raw.name),
      LoginProvider.fromString(raw.provider),
      raw.createdAt,
      raw.updatedAt,
      raw.passwordHash ?? undefined,
    );
  }

  static toPersistence(user: User) {
    return {
      id: user.getId().value,
      email: user.getEmail().value,
      name: user.getName().value,
      provider: user.getProvider().value,
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      passwordHash: user.getPasswordHash() ?? undefined,
    };
  }
}
