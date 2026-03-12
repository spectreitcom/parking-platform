import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateOrganizationUserCommandHandler } from '../create-organization-user.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { CreateOrganizationUserCommand } from '../../commands/create-organization-user.command';
import { OrganizationUser } from '../../../domain/organization-user';
import { AppError } from '../../../../../shared/errors';
import { TransactionRunner } from '../../../../../shared/prisma/transaction-runner';
import { OutboxService } from '../../../../../shared/outbox/outbox.service';
import { IntegrationEvent } from '../../../../../shared/outbox/outbox.types';

describe('CreateOrganizationUserCommandHandler', () => {
  let handler: CreateOrganizationUserCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let transactionRunner: jest.Mocked<TransactionRunner>;
  let outboxService: jest.Mocked<OutboxService>;

  beforeEach(async () => {
    organizationUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as any;

    eventPublisher = {
      mergeObjectContext: jest.fn((obj) => obj),
    } as any;

    transactionRunner = {
      runInTransaction: jest.fn((cb) => cb('prisma-tx')),
    } as any;

    outboxService = {
      enqueue: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrganizationUserCommandHandler,
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

    handler = module.get<CreateOrganizationUserCommandHandler>(
      CreateOrganizationUserCommandHandler,
    );
  });

  it('should create organization user successfully', async () => {
    // Given
    const command = new CreateOrganizationUserCommand(
      'test@example.com',
      'Test User',
      'password-hash',
    );

    organizationUserRepository.findByEmail.mockResolvedValue(null);

    // When
    const result = await handler.execute(command);

    // Then
    expect(result).toBeDefined();
    expect(organizationUserRepository.findByEmail).toHaveBeenCalledWith(
      command.email,
      'prisma-tx',
    );
    expect(organizationUserRepository.save).toHaveBeenCalledWith(
      expect.any(OrganizationUser),
      {
        isNew: true,
        tx: 'prisma-tx',
      },
    );
    expect(outboxService.enqueue).toHaveBeenCalledWith(
      expect.any(IntegrationEvent),
      { deduplicate: true },
      'prisma-tx',
    );
  });

  it('should throw error if organization user already exists', async () => {
    // Given
    const command = new CreateOrganizationUserCommand(
      'test@example.com',
      'Test User',
      'password-hash',
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
