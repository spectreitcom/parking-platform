import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '../commands/change-password.command';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { PasswordService } from '../ports/password.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { AppError } from 'src/shared/errors';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordCommandHandler implements ICommandHandler<
  ChangePasswordCommand,
  void
> {
  constructor(
    private readonly organizationUserRepository: OrganizationUserRepository,
    private readonly passwordService: PasswordService,
    private readonly eventPublisher: EventPublisher,
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    await this.transactionRunner.runInTransaction(async (prisma) => {
      const { organizationUserId, existingPassword, newPassword } = command;

      const organizationUser = await this.organizationUserRepository.findById(
        organizationUserId,
        prisma,
      );

      if (!organizationUser) {
        throw new AppError('ENTITY_NOT_FOUND', 'Organization user not found');
      }

      const passwordHash = organizationUser.getPasswordHash();

      if (!passwordHash) {
        throw new AppError('WRONG_CREDENTIALS', 'Invalid existing password');
      }

      const isPasswordValid = await this.passwordService.compare(
        passwordHash,
        existingPassword,
      );

      if (!isPasswordValid) {
        throw new AppError('WRONG_CREDENTIALS', 'Invalid existing password');
      }

      const newPasswordHash = await this.passwordService.create(newPassword);

      this.eventPublisher.mergeObjectContext(organizationUser);

      organizationUser.changePassword(newPasswordHash);

      await this.organizationUserRepository.save(organizationUser, {
        isNew: false,
        tx: prisma,
      });

      organizationUser.commit();
    });
  }
}
