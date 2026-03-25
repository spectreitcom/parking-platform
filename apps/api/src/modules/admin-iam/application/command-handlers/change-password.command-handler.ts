import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '../commands/change-password.command';
import { AdminUserRepository } from '../ports/admin-user.repository';
import { AppError } from 'src/shared/errors';
import { PasswordService } from '../ports/password.service';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordCommandHandler implements ICommandHandler<
  ChangePasswordCommand,
  void
> {
  constructor(
    private readonly adminUserRepository: AdminUserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const { adminUserId, existingPassword, newPassword } = command;

    const adminUser = await this.adminUserRepository.findById(adminUserId);

    if (!adminUser) {
      throw new AppError('ENTITY_NOT_FOUND', 'Admin user not found');
    }

    this.eventPublisher.mergeObjectContext(adminUser);

    const isValid = await this.passwordService.compare(
      adminUser.getPasswordHash() ?? '',
      existingPassword,
    );

    if (!isValid) {
      throw new AppError('VALIDATION_ERROR', 'Invalid existing password');
    }

    const newHash = await this.passwordService.create(newPassword);
    adminUser.changePassword(newHash);
    await this.adminUserRepository.save(adminUser);
    adminUser.commit();
  }
}
