import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '../commands/change-password.command';
import { UserRepository } from '../ports/user.repository';
import { AppError } from 'src/shared/errors';
import { PasswordService } from '../ports/password.service';
import { LoginProvider } from 'src/modules/user-iam/domain/value-objects/login-provider';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordCommandHandler implements ICommandHandler<
  ChangePasswordCommand,
  void
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const { userId, existingPassword, newPassword } = command;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('ENTITY_NOT_FOUND', 'User not found');
    }

    if (!user.getProvider().equals(LoginProvider.credentials())) {
      throw new AppError(
        'FORBIDDEN_OPERATION',
        'Cannot change password for this user',
      );
    }

    const isValid = await this.passwordService.compare(
      user.getPasswordHash() ?? '',
      existingPassword,
    );

    if (!isValid) {
      throw new AppError('VALIDATION_ERROR', 'Invalid existing password');
    }

    const newHash = await this.passwordService.create(newPassword);

    this.eventPublisher.mergeObjectContext(user);
    user.changePassword(newHash);

    await this.userRepository.save(user);

    user.commit();
  }
}
