import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../commands/reset-password.command';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { ResetPasswordTokenService } from '../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../ports/reset-password-token.storage';
import { PasswordService } from '../ports/password.service';
import { AppError } from 'src/shared/errors';
import { OrganizationUserStatus } from '../../domain/value-objects/organization-user-status';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler implements ICommandHandler<
  ResetPasswordCommand,
  void
> {
  constructor(
    private readonly organizationUserRepository: OrganizationUserRepository,
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

    const organizationUser =
      await this.organizationUserRepository.findById(userId);

    if (!organizationUser) {
      throw new AppError('ENTITY_NOT_FOUND', 'Organization user not found');
    }

    this.eventPublisher.mergeObjectContext(organizationUser);

    const passwordHash = await this.passwordService.create(password);
    organizationUser.changePassword(passwordHash);

    if (organizationUser.getStatus().equals(OrganizationUserStatus.invited())) {
      organizationUser.activate();
    }

    await this.organizationUserRepository.save(organizationUser);

    await this.resetPasswordTokenStorage.invalidate(resetPasswordTokenHash);

    organizationUser.commit();
  }
}
