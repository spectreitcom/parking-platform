import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../commands/reset-password.command';
import { AdminUserRepository } from '../ports/admin-user.repository';
import { ResetPasswordTokenService } from '../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../ports/reset-password-token.storage';
import { PasswordService } from '../ports/password.service';
import { AppError } from '../../../../shared/errors';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler implements ICommandHandler<
  ResetPasswordCommand,
  void
> {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
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

    const adminUser = await this.adminUserRepository.findById(userId);

    if (!adminUser) {
      throw new AppError('ENTITY_NOT_FOUND', 'Admin user not found');
    }

    await this.resetPasswordTokenStorage.invalidate(resetPasswordTokenHash);

    this.eventPublisher.mergeObjectContext(adminUser);

    const passwordHash = await this.passwordService.create(password);
    adminUser.changePassword(passwordHash);
    await this.adminUserRepository.save(adminUser);
    adminUser.commit();
  }
}
