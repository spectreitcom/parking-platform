import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { RequestResetPasswordCommandHandler } from '../request-reset-password.command-handler';
import { RequestResetPasswordCommand } from '../../commands/request-reset-password.command';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { ResetPasswordTokenService } from '../../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../../ports/reset-password-token.storage';
import { TransactionRunner } from '../../../../../shared/prisma/transaction-runner';
import { OutboxService } from '../../../../../shared/outbox/outbox.service';
import { AdminUser } from '../../../domain/admin-user';
import { AdminId } from '../../../domain/value-objects/admin-id';
import { Email } from '../../../../../shared/value-objects/email';
import { AdminDisplayName } from '../../../domain/value-objects/admin-display-name';
import { AdminStatus } from '../../../domain/value-objects/admin-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { AppError } from '../../../../../shared/errors';
import { IntegrationEvent } from '../../../../../shared/outbox/outbox.types';

describe('RequestResetPasswordCommandHandler', () => {
  let handler: RequestResetPasswordCommandHandler;
  let adminUserRepository: jest.Mocked<AdminUserRepository>;
  let resetPasswordService: jest.Mocked<ResetPasswordTokenService>;
  let resetPasswordTokenStorage: jest.Mocked<ResetPasswordTokenStorage>;
  let transactionRunner: jest.Mocked<TransactionRunner>;
  let outboxService: jest.Mocked<OutboxService>;

  beforeEach(async () => {
    adminUserRepository = {
      findByEmail: jest.fn(),
    } as any;

    resetPasswordService = {
      createHash: jest.fn(),
    } as any;

    resetPasswordTokenStorage = {
      insert: jest.fn(),
    } as any;

    transactionRunner = {
      runInTransaction: jest.fn((cb) => cb('prisma-tx')),
    } as any;

    outboxService = {
      enqueue: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestResetPasswordCommandHandler,
        {
          provide: AdminUserRepository,
          useValue: adminUserRepository,
        },
        {
          provide: ResetPasswordTokenService,
          useValue: resetPasswordService,
        },
        {
          provide: ResetPasswordTokenStorage,
          useValue: resetPasswordTokenStorage,
        },
        {
          provide: TransactionRunner,
          useValue: transactionRunner,
        },
        {
          provide: OutboxService,
          useValue: outboxService,
        },
      ],
    }).compile();

    handler = module.get<RequestResetPasswordCommandHandler>(
      RequestResetPasswordCommandHandler,
    );
  });

  it('should request reset password successfully', async () => {
    // Given
    const email = 'test@example.com';
    const command = new RequestResetPasswordCommand(email);
    const adminUserId = randomUUID();
    const adminUser = new AdminUser(
      AdminId.fromString(adminUserId),
      Email.fromString(email),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.active(),
      AggregateVersion.one(),
      new Date(),
      new Date(),
    );

    adminUserRepository.findByEmail.mockResolvedValue(adminUser);
    resetPasswordService.createHash.mockReturnValue('hashed-token');

    // When
    await handler.execute(command);

    // Then
    expect(transactionRunner.runInTransaction).toHaveBeenCalled();
    expect(adminUserRepository.findByEmail).toHaveBeenCalledWith(
      email,
      'prisma-tx',
    );
    expect(resetPasswordService.createHash).toHaveBeenCalled();
    expect(resetPasswordTokenStorage.insert).toHaveBeenCalledWith(
      adminUserId,
      'hashed-token',
    );
    expect(outboxService.enqueue).toHaveBeenCalledWith(
      expect.any(IntegrationEvent),
      { deduplicate: true },
      'prisma-tx',
    );

    const event = outboxService.enqueue.mock.calls[0][0] as IntegrationEvent<
      any,
      any
    >;
    expect(event.type).toBe('admin-iam.admin-user.requested-reset-password.v1');
    expect(event.payload.email).toBe(email);
    expect(event.payload.resetPasswordToken).toBeDefined();
    expect(event.payload.displayName).toBe('Test User');
  });

  it('should throw error if admin user not found', async () => {
    // Given
    const email = 'notfound@example.com';
    const command = new RequestResetPasswordCommand(email);
    adminUserRepository.findByEmail.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Admin user not found'),
    );
  });
});
