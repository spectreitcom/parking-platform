import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RegisterUserCommand } from 'src/modules/user-iam/application/commands/register-user.command';
import { UserRepository } from 'src/modules/user-iam/application/ports/user.repository';
import { PasswordService } from 'src/modules/user-iam/application/ports/password.service';
import { AppError } from 'src/shared/errors';
import { User } from 'src/modules/user-iam/domain/user';
import { LoginProvider } from 'src/modules/user-iam/domain/value-objects/login-provider';

@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler implements ICommandHandler<
  RegisterUserCommand,
  string
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<string> {
    const { name, password, email } = command;

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        'ALREADY_EXISTS',
        'User with provided email already exists',
      );
    }

    const passwordHash = await this.passwordService.create(password);

    const user = User.create(
      email,
      name,
      LoginProvider.credentials().value,
      passwordHash,
    );

    this.eventPublisher.mergeObjectContext(user);
    await this.userRepository.save(user);
    user.commit();

    return user.getId().value;
  }
}
