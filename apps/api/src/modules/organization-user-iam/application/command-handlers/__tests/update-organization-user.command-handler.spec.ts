import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { UpdateOrganizationUserCommandHandler } from '../update-organization-user.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { UpdateOrganizationUserCommand } from '../../commands/update-organization-user.command';
import { OrganizationUser } from '../../../domain/organization-user';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { Email } from '../../../../../shared/value-objects/email';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { AppError } from '../../../../../shared/errors';
import { TransactionRunner } from '../../../../../shared/prisma/transaction-runner';
import { OutboxService } from '../../../../../shared/outbox/outbox.service';
import { IntegrationEvent } from '../../../../../shared/outbox/outbox.types';

describe('UpdateOrganizationUserCommandHandler', () => {
  let handler: UpdateOrganizationUserCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let transactionRunner: jest.Mocked<TransactionRunner>;
  let outboxService: jest.Mocked<OutboxService>;

  beforeEach(async () => {
    organizationUserRepository = {
      findById: jest.fn(),
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
        UpdateOrganizationUserCommandHandler,
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

    handler = module.get<UpdateOrganizationUserCommandHandler>(
      UpdateOrganizationUserCommandHandler,
    );
  });

  it('should update organization user successfully', async () => {
    // Given
    const organizationUserId = randomUUID();
    const version = 1;
    const newDisplayName = 'Updated Name';
    const command = new UpdateOrganizationUserCommand(
      organizationUserId,
      newDisplayName,
      version,
    );

    const organizationUser = new OrganizationUser(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.active(),
      AggregateVersion.fromNumber(version),
      OrganizationUserDisplayName.fromString('Old Name'),
      new Date(),
      new Date(),
    );

    organizationUserRepository.findById.mockResolvedValue(organizationUser);

    // When
    await handler.execute(command);

    // Then
    expect(organizationUserRepository.findById).toHaveBeenCalledWith(
      organizationUserId,
      'prisma-tx',
    );
    expect(organizationUserRepository.save).toHaveBeenCalledWith(
      organizationUser,
      {
        isNew: false,
        tx: 'prisma-tx',
      },
    );
    expect(organizationUser.getDisplayName().value).toBe(newDisplayName);
    expect(outboxService.enqueue).toHaveBeenCalledWith(
      expect.any(IntegrationEvent),
      { deduplicate: false },
      'prisma-tx',
    );
  });

  it('should throw error if organization user not found', async () => {
    // Given
    const organizationUserId = randomUUID();
    const command = new UpdateOrganizationUserCommand(
      organizationUserId,
      'Name',
      1,
    );
    organizationUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization user not found'),
    );
  });

  it('should throw error if version mismatch', async () => {
    // Given
    const organizationUserId = randomUUID();
    const command = new UpdateOrganizationUserCommand(
      organizationUserId,
      'Name',
      1,
    );

    const organizationUser = new OrganizationUser(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.active(),
      AggregateVersion.fromNumber(2),
      OrganizationUserDisplayName.fromString('Old Name'),
      new Date(),
      new Date(),
    );

    organizationUserRepository.findById.mockResolvedValue(organizationUser);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Organization User with id ${organizationUserId} has been modified by another process`,
      ),
    );
  });
});
