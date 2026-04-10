import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../commands/reset-password.command';
import { UserRepository } from '../ports/user.repository';
import { ResetPasswordTokenService } from '../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../ports/reset-password-token.storage';
import { PasswordService } from '../ports/password.service';
import { AppError } from 'src/shared/errors';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler implements ICommandHandler<
  ResetPasswordCommand,
  void
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly resetPasswordTokenService: ResetPasswordTokenService,
    private readonly resetPasswordTokenStorage: ResetPasswordTokenStorage,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    const { password, resetPasswordToken } = command;

    const resetPasswordTokenHash =
      this.resetPasswordTokenService.createHash(resetPasswordToken);

    const userId = await this.resetPasswordTokenStorage.validate(
      resetPasswordTokenHash,
    );

    if (!userId) {
      throw new AppError('VALIDATION_ERROR', 'Invalid reset password token');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('ENTITY_NOT_FOUND', 'User not found');
    }

    await this.resetPasswordTokenStorage.invalidate(resetPasswordTokenHash);

    this.eventPublisher.mergeObjectContext(user);

    const passwordHash = await this.passwordService.create(password);
    user.changePassword(passwordHash);

    await this.userRepository.save(user);

    user.commit();
  }
}
