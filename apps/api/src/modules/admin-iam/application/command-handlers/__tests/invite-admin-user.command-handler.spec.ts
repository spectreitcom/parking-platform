import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { InviteAdminUserCommandHandler } from '../invite-admin-user.command-handler';
import { AdminUserRepository } from '../../ports/admin-user.repository';
import { OutboxService } from '../../../../../shared/outbox/outbox.service';
import { TransactionRunner } from '../../../../../shared/prisma/transaction-runner';
import { InviteAdminUserCommand } from '../../commands/invite-admin-user.command';
import { AdminUser } from '../../../domain/admin-user';
import { AppError } from '../../../../../shared/errors';

describe('InviteAdminUserCommandHandler', () => {
  let handler: InviteAdminUserCommandHandler;
  let adminUserRepository: jest.Mocked<AdminUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let outboxService: jest.Mocked<OutboxService>;
  let transactionRunner: jest.Mocked<TransactionRunner>;

  beforeEach(async () => {
    adminUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as typeof adminUserRepository;

    eventPublisher = {
      mergeObjectContext: jest.fn(<T>(obj: T) => obj),
    } as unknown as typeof eventPublisher;

    outboxService = {
      enqueue: jest.fn(),
    } as unknown as typeof outboxService;

    transactionRunner = {
      runInTransaction: jest.fn((cb: (tx: string) => unknown) =>
        cb('prisma-tx'),
      ),
    } as unknown as typeof transactionRunner;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteAdminUserCommandHandler,
        {
          provide: AdminUserRepository,
          useValue: adminUserRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
        {
          provide: OutboxService,
          useValue: outboxService,
        },
        {
          provide: TransactionRunner,
          useValue: transactionRunner,
        },
      ],
    }).compile();

    handler = module.get<InviteAdminUserCommandHandler>(
      InviteAdminUserCommandHandler,
    );
  });

  it('should invite admin user successfully', async () => {
    // Given
    const email = 'test@example.com';
    const displayName = 'Test User';
    const command = new InviteAdminUserCommand(email, displayName);

    adminUserRepository.findByEmail.mockResolvedValue(null);

    // When
    const resultId = await handler.execute(command);

    // Then
    expect(transactionRunner.runInTransaction).toHaveBeenCalled();
    expect(adminUserRepository.findByEmail).toHaveBeenCalledWith(
      email,
      'prisma-tx',
    );
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalled();
    expect(adminUserRepository.save).toHaveBeenCalledWith(
      expect.any(AdminUser),
      {
        isNew: true,
        tx: 'prisma-tx',
      },
    );
    expect(outboxService.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'admin-iam.admin-user.invited.v1',
        payload: {
          email,
          displayName,
          adminUserId: resultId,
        },
      }),
      { deduplicate: true },
      'prisma-tx',
    );
    expect(resultId).toBeDefined();
  });

  it('should throw error if admin user already exists', async () => {
    // Given
    const email = 'test@example.com';
    const command = new InviteAdminUserCommand(email, 'Test User');

    adminUserRepository.findByEmail.mockResolvedValue({} as AdminUser);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ALREADY_EXISTS', 'Admin user already exists'),
    );
  });
});
