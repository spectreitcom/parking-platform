import { Test, TestingModule } from '@nestjs/testing';
import { AdminUser } from '../../../domain/admin-user';
import { IntegrationEvent } from '../../../../../shared/outbox/outbox.types';
import { RequestResetPasswordCommand } from '../../commands/request-reset-password.command';
import { OutboxService } from '../../../../../shared/outbox/outbox.service';
import { TransactionRunner } from '../../../../../shared/prisma/transaction-runner';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { RequestResetPasswordCommandHandler } from '../request-reset-password.command-handler';
import { AdminId } from '../../../domain/value-objects/admin-id';
import { Email } from '../../../../../shared/value-objects/email';
import { AdminDisplayName } from '../../../domain/value-objects/admin-display-name';
import { AdminStatus } from '../../../domain/value-objects/admin-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { randomUUID } from 'node:crypto';

describe('RequestResetPasswordCommandHandler', () => {
  let handler: RequestResetPasswordCommandHandler;
  let adminUserRepository: jest.Mocked<AdminUserRepository>;
  let outboxService: jest.Mocked<OutboxService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestResetPasswordCommandHandler,
        {
          provide: AdminUserRepository,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: TransactionRunner,
          useValue: {
            runInTransaction: jest.fn((cb: (tx: string) => Promise<unknown>) =>
              cb('mock-prisma-tx'),
            ),
          },
        },
        {
          provide: OutboxService,
          useValue: {
            enqueue: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<RequestResetPasswordCommandHandler>(
      RequestResetPasswordCommandHandler,
    );
    adminUserRepository = module.get(AdminUserRepository);
    outboxService = module.get(OutboxService);
  });

  it('should enqueue an integration event when admin user exists', async () => {
    const userId = randomUUID();
    const email = 'test@example.com';
    const command = new RequestResetPasswordCommand(email);
    const adminUser = AdminUser.reconstruct(
      AdminId.fromString(userId),
      Email.fromString(email),
      false,
      AdminDisplayName.fromString('Test User'),
      AdminStatus.active(),
      AggregateVersion.one(),
      new Date(),
      new Date(),
      'hash',
    );
    adminUserRepository.findByEmail.mockResolvedValue(adminUser);

    await handler.execute(command);

    expect(adminUserRepository.findByEmail).toHaveBeenCalledWith(
      email,
      'mock-prisma-tx',
    );
    expect(outboxService.enqueue).toHaveBeenCalledWith(
      expect.any(IntegrationEvent),
      { deduplicate: true },
      'mock-prisma-tx',
    );
    const enqueuedEvent = outboxService.enqueue.mock.calls[0][0];
    expect(enqueuedEvent.type).toBe(
      'admin-iam.admin-user.requested-reset-password.v1',
    );
    expect(enqueuedEvent.payload).toEqual({
      email: email,
      displayName: 'Test User',
      adminUserId: userId,
    });
  });

  it('should not enqueue an integration event when admin user does not exist', async () => {
    const email = 'nonexistent@example.com';
    const command = new RequestResetPasswordCommand(email);
    adminUserRepository.findByEmail.mockResolvedValue(null);

    await handler.execute(command);

    expect(adminUserRepository.findByEmail).toHaveBeenCalledWith(
      email,
      'mock-prisma-tx',
    );
    expect(outboxService.enqueue).not.toHaveBeenCalled();
  });
});
