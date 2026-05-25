import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { ChangePasswordCommandHandler } from '../change-password.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { PasswordService } from '../../ports/password.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { ChangePasswordCommand } from '../../commands/change-password.command';
import { OrganizationUser } from '../../../domain/organization-user';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { Email } from 'src/shared/value-objects/email';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';
import { AppError } from 'src/shared/errors';

describe('ChangePasswordCommandHandler', () => {
  let handler: ChangePasswordCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let transactionRunner: jest.Mocked<TransactionRunner>;

  beforeEach(async () => {
    organizationUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as typeof organizationUserRepository;

    passwordService = {
      create: jest.fn(),
      compare: jest.fn(),
    };

    eventPublisher = {
      mergeObjectContext: jest.fn(<T>(obj: T) => obj),
    } as unknown as typeof eventPublisher;

    transactionRunner = {
      runInTransaction: jest.fn((cb: (tx: string) => unknown) =>
        cb('prisma-tx'),
      ),
    } as unknown as typeof transactionRunner;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordCommandHandler,
        {
          provide: OrganizationUserRepository,
          useValue: organizationUserRepository,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
        {
          provide: TransactionRunner,
          useValue: transactionRunner,
        },
      ],
    }).compile();

    handler = module.get<ChangePasswordCommandHandler>(
      ChangePasswordCommandHandler,
    );
  });

  it('should change password successfully', async () => {
    // Given
    const organizationUserId = randomUUID();
    const existingPassword = 'old-password';
    const newPassword = 'new-password';
    const existingPasswordHash = 'old-password-hash';
    const newPasswordHash = 'new-password-hash';
    const command = new ChangePasswordCommand(
      organizationUserId,
      existingPassword,
      newPassword,
    );

    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.active(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
      existingPasswordHash,
    );

    organizationUserRepository.findById.mockResolvedValue(organizationUser);
    passwordService.compare.mockResolvedValue(true);
    passwordService.create.mockResolvedValue(newPasswordHash);
    const commitSpy = jest.spyOn(organizationUser, 'commit');

    // When
    await handler.execute(command);

    // Then
    expect(transactionRunner.runInTransaction).toHaveBeenCalled();
    expect(organizationUserRepository.findById).toHaveBeenCalledWith(
      organizationUserId,
      'prisma-tx',
    );
    expect(passwordService.compare).toHaveBeenCalledWith(
      existingPasswordHash,
      existingPassword,
    );
    expect(passwordService.create).toHaveBeenCalledWith(newPassword);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(
      organizationUser,
    );
    expect(organizationUser.getPasswordHash()).toBe(newPasswordHash);
    expect(organizationUserRepository.save).toHaveBeenCalledWith(
      organizationUser,
      {
        isNew: false,
        tx: 'prisma-tx',
      },
    );
    expect(commitSpy).toHaveBeenCalled();
  });

  it('should throw error if organization user not found', async () => {
    // Given
    const organizationUserId = randomUUID();
    const command = new ChangePasswordCommand(organizationUserId, 'old', 'new');

    organizationUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization user not found'),
    );
  });

  it('should throw error if existing password does not match', async () => {
    // Given
    const organizationUserId = randomUUID();
    const existingPassword = 'old-password';
    const command = new ChangePasswordCommand(
      organizationUserId,
      existingPassword,
      'new-password',
    );

    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.active(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
      'hash',
    );

    organizationUserRepository.findById.mockResolvedValue(organizationUser);
    passwordService.compare.mockResolvedValue(false);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('WRONG_CREDENTIALS', 'Invalid existing password'),
    );
  });
});
