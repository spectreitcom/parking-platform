import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { RequestResetPasswordCommandHandler } from '../request-reset-password.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { ResetPasswordTokenService } from '../../ports/reset-password-token.service';
import { ResetPasswordTokenStorage } from '../../ports/reset-password-token.storage';
import { TransactionRunner } from '../../../../../shared/prisma/transaction-runner';
import { OutboxService } from '../../../../../shared/outbox/outbox.service';
import { RequestResetPasswordCommand } from '../../commands/request-reset-password.command';
import { OrganizationUser } from '../../../domain/organization-user';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { Email } from '../../../../../shared/value-objects/email';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { IntegrationEvent } from '../../../../../shared/outbox/outbox.types';

describe('RequestResetPasswordCommandHandler', () => {
  let handler: RequestResetPasswordCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let resetPasswordService: jest.Mocked<ResetPasswordTokenService>;
  let resetPasswordTokenStorage: jest.Mocked<ResetPasswordTokenStorage>;
  let transactionRunner: jest.Mocked<TransactionRunner>;
  let outboxService: jest.Mocked<OutboxService>;

  beforeEach(async () => {
    organizationUserRepository = {
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
          provide: OrganizationUserRepository,
          useValue: organizationUserRepository,
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
    const organizationUserId = randomUUID();
    const organizationUser = new OrganizationUser(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString(emailStr),
      OrganizationUserStatus.active(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
    );

    organizationUserRepository.findByEmail.mockResolvedValue(organizationUser);
    resetPasswordService.createHash.mockReturnValue('hashed-token');

    // When
    await handler.execute(command);

    // Then
    expect(organizationUserRepository.findByEmail).toHaveBeenCalledWith(
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
      organizationUserId,
      'hashed-token',
    );
  });

  it('should do nothing if organization user not found', async () => {
    // Given
    const emailStr = 'notfound@example.com';
    const command = new RequestResetPasswordCommand(emailStr);
    organizationUserRepository.findByEmail.mockResolvedValue(null);

    // When
    await handler.execute(command);

    // Then
    expect(organizationUserRepository.findByEmail).toHaveBeenCalledWith(
      emailStr,
      'prisma-tx',
    );
    expect(outboxService.enqueue).not.toHaveBeenCalled();
    expect(resetPasswordTokenStorage.insert).not.toHaveBeenCalled();
  });
});
