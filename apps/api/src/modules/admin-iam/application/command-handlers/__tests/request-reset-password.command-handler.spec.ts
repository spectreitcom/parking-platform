import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { RequestResetPasswordCommandHandler } from '../request-reset-password.command-handler';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { ResetPasswordTokenService } from '../../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../../ports/reset-password-token.storage';
import { TransactionRunner } from '../../../../../shared/prisma/transaction-runner';
import { OutboxService } from '../../../../../shared/outbox/outbox.service';
import { RequestResetPasswordCommand } from '../../commands/request-reset-password.command';
import { AdminUser } from '../../../domain/admin-user';
import { AdminId } from '../../../domain/value-objects/admin-id';
import { Email } from '../../../../../shared/value-objects/email';
import { AdminDisplayName } from '../../../domain/value-objects/admin-display-name';
import { AdminStatus } from '../../../domain/value-objects/admin-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
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
    } as unknown as typeof adminUserRepository;

    resetPasswordService = {
      createHash: jest.fn(),
    } as unknown as typeof resetPasswordService;

    resetPasswordTokenStorage = {
      insert: jest.fn(),
    } as unknown as typeof resetPasswordTokenStorage;

    transactionRunner = {
      runInTransaction: jest.fn((cb: (arg: unknown) => unknown) =>
        cb('prisma-tx'),
      ),
    } as unknown as typeof transactionRunner;

    outboxService = {
      enqueue: jest.fn(),
    } as unknown as typeof outboxService;

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
    const emailStr = 'test@example.com';
    const command = new RequestResetPasswordCommand(emailStr);
    const adminUserId = randomUUID();
    const adminUser = AdminUser.reconstruct(
      AdminId.fromString(adminUserId),
      Email.fromString(emailStr),
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
    expect(adminUserRepository.findByEmail).toHaveBeenCalledWith(
      emailStr,
      'prisma-tx',
    );
    expect(resetPasswordService.createHash).toHaveBeenCalledWith(
      expect.any(String),
    );
    expect(outboxService.enqueue).toHaveBeenCalledWith(
      expect.any(IntegrationEvent),
      { deduplicate: true },
      'prisma-tx',
    );
    expect(resetPasswordTokenStorage.insert).toHaveBeenCalledWith(
      adminUserId,
      'hashed-token',
    );
  });

  it('should do nothing if admin user not found', async () => {
    // Given
    const emailStr = 'notfound@example.com';
    const command = new RequestResetPasswordCommand(emailStr);
    adminUserRepository.findByEmail.mockResolvedValue(null);

    // When
    await handler.execute(command);

    // Then
    expect(adminUserRepository.findByEmail).toHaveBeenCalledWith(
      emailStr,
      'prisma-tx',
    );
    expect(outboxService.enqueue).not.toHaveBeenCalled();
    expect(resetPasswordTokenStorage.insert).not.toHaveBeenCalled();
  });
});
