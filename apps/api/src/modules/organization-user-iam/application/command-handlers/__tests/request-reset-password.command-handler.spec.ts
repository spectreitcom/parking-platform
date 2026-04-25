import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationUser } from '../../../domain/organization-user';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import { RequestResetPasswordCommand } from '../../commands/request-reset-password.command';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { TransactionRunner } from 'src/shared/prisma/transaction-runner';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { RequestResetPasswordCommandHandler } from '../request-reset-password.command-handler';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { Email } from 'src/shared/value-objects/email';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from 'src/shared/value-objects/aggregate-version';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';
import { randomUUID } from 'node:crypto';

describe('RequestResetPasswordCommandHandler', () => {
  let handler: RequestResetPasswordCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let outboxService: jest.Mocked<OutboxService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestResetPasswordCommandHandler,
        {
          provide: OrganizationUserRepository,
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
    organizationUserRepository = module.get(OrganizationUserRepository);
    outboxService = module.get(OutboxService);
  });

  it('should enqueue an integration event when organization user exists', async () => {
    const userId = randomUUID();
    const email = 'test@example.com';
    const command = new RequestResetPasswordCommand(email);
    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(userId),
      Email.fromString(email),
      OrganizationUserStatus.active(),
      AggregateVersion.one(),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
      'hash',
    );
    organizationUserRepository.findByEmail.mockResolvedValue(organizationUser);

    await handler.execute(command);

    expect(organizationUserRepository.findByEmail).toHaveBeenCalledWith(
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
      'organization-user-iam.organization-user.requested-reset-password.v1',
    );
    expect(enqueuedEvent.payload).toEqual({
      email: email,
      organizationUserId: userId,
      displayName: 'Test User',
    });
  });

  it('should not enqueue an integration event when organization user does not exist', async () => {
    const email = 'nonexistent@example.com';
    const command = new RequestResetPasswordCommand(email);
    organizationUserRepository.findByEmail.mockResolvedValue(null);

    await handler.execute(command);

    expect(organizationUserRepository.findByEmail).toHaveBeenCalledWith(
      email,
      'mock-prisma-tx',
    );
    expect(outboxService.enqueue).not.toHaveBeenCalled();
  });
});
