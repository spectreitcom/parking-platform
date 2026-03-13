import { Test, TestingModule } from '@nestjs/testing';
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
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';

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
    } as unknown as typeof organizationUserRepository;

    resetPasswordService = {
      createHash: jest.fn(),
    } as unknown as typeof resetPasswordService;

    resetPasswordTokenStorage = {
      insert: jest.fn(),
    } as unknown as typeof resetPasswordTokenStorage;

    transactionRunner = {
      runInTransaction: jest.fn((cb: (tx: string) => unknown) =>
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
    const email = 'test@example.com';
    const command = new RequestResetPasswordCommand(email);
    const tokenHash = 'token-hash';

    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.create(),
      Email.fromString(email),
      OrganizationUserStatus.active(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
    );

    organizationUserRepository.findByEmail.mockResolvedValue(organizationUser);
    resetPasswordService.createHash.mockReturnValue(tokenHash);

    // When
    await handler.execute(command);

    // Then
    expect(transactionRunner.runInTransaction).toHaveBeenCalled();
    expect(organizationUserRepository.findByEmail).toHaveBeenCalledWith(
      email,
      'prisma-tx',
    );
    expect(resetPasswordService.createHash).toHaveBeenCalled();
    expect(outboxService.enqueue).toHaveBeenCalled();
    expect(resetPasswordTokenStorage.insert).toHaveBeenCalledWith(
      organizationUser.getId().value,
      tokenHash,
    );
  });

  it('should do nothing if user not found', async () => {
    // Given
    const email = 'notfound@example.com';
    const command = new RequestResetPasswordCommand(email);

    organizationUserRepository.findByEmail.mockResolvedValue(null);

    // When
    await handler.execute(command);

    // Then
    expect(resetPasswordService.createHash).not.toHaveBeenCalled();
    expect(outboxService.enqueue).not.toHaveBeenCalled();
    expect(resetPasswordTokenStorage.insert).not.toHaveBeenCalled();
  });
});
