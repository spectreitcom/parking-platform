import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { InviteOrganizationUserCommandHandler } from '../invite-organization-user.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { InviteOrganizationUserCommand } from '../../commands/invite-organization-user.command';
import { OrganizationUser } from '../../../domain/organization-user';
import { AppError } from '../../../../../shared/errors';
import { TransactionRunner } from '../../../../../shared/prisma/transaction-runner';
import { OutboxService } from '../../../../../shared/outbox/outbox.service';
import { IntegrationEvent } from '../../../../../shared/outbox/outbox.types';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';

describe('InviteOrganizationUserCommandHandler', () => {
  let handler: InviteOrganizationUserCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let transactionRunner: jest.Mocked<TransactionRunner>;
  let outboxService: jest.Mocked<OutboxService>;

  beforeEach(async () => {
    organizationUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as typeof organizationUserRepository;

    eventPublisher = {
      mergeObjectContext: jest.fn(<T>(obj: T) => obj),
    } as unknown as typeof eventPublisher;

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
        InviteOrganizationUserCommandHandler,
        {
          provide: OrganizationUserRepository,
          useValue: organizationUserRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
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

    handler = module.get<InviteOrganizationUserCommandHandler>(
      InviteOrganizationUserCommandHandler,
    );
  });

  it('should invite organization user successfully', async () => {
    // Given
    const command = new InviteOrganizationUserCommand(
      'test@example.com',
      'Test User',
    );

    organizationUserRepository.findByEmail.mockResolvedValue(null);

    // When
    const result = await handler.execute(command);

    // Then
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(organizationUserRepository.findByEmail).toHaveBeenCalledWith(
      command.email,
      'prisma-tx',
    );
    expect(organizationUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.any(OrganizationUserStatus) as unknown,
      }),
      {
        isNew: true,
        tx: 'prisma-tx',
      },
    );
    // Extra check for status since it was invited
    const savedUser = organizationUserRepository.save.mock.calls[0][0];
    expect(savedUser.getStatus().equals(OrganizationUserStatus.invited())).toBe(
      true,
    );

    expect(outboxService.enqueue).toHaveBeenCalledWith(
      expect.any(IntegrationEvent),
      { deduplicate: true },
      'prisma-tx',
    );
  });

  it('should throw error if organization user already exists', async () => {
    // Given
    const command = new InviteOrganizationUserCommand(
      'test@example.com',
      'Test User',
    );

    organizationUserRepository.findByEmail.mockResolvedValue(
      {} as OrganizationUser,
    );

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ALREADY_EXISTS', 'Organization user already exists'),
    );
  });
});
