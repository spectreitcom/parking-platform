import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { ActivateOrganizationUserCommandHandler } from '../activate-organization-user.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { ActivateOrganizationUserCommand } from '../../commands/activate-organization-user.command';
import { OrganizationUser } from '../../../domain/organization-user';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { Email } from '../../../../../shared/value-objects/email';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { AppError } from '../../../../../shared/errors';
import { TransactionRunner } from '../../../../../shared/prisma/transaction-runner';

describe('ActivateOrganizationUserCommandHandler', () => {
  let handler: ActivateOrganizationUserCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let transactionRunner: jest.Mocked<TransactionRunner>;

  beforeEach(async () => {
    organizationUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as any;

    eventPublisher = {
      mergeObjectContext: jest.fn((obj) => obj),
    } as any;

    transactionRunner = {
      runInTransaction: jest.fn((cb) => cb('prisma-tx')),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivateOrganizationUserCommandHandler,
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
      ],
    }).compile();

    handler = module.get<ActivateOrganizationUserCommandHandler>(
      ActivateOrganizationUserCommandHandler,
    );
  });

  it('should activate organization user successfully', async () => {
    // Given
    const organizationUserId = randomUUID();
    const version = 1;
    const command = new ActivateOrganizationUserCommand(
      organizationUserId,
      version,
    );

    const organizationUser = new OrganizationUser(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.suspended(),
      AggregateVersion.fromNumber(version),
      OrganizationUserDisplayName.fromString('Test User'),
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
    expect(
      organizationUser.getStatus().equals(OrganizationUserStatus.active()),
    ).toBe(true);
  });

  it('should throw error if organization user not found', async () => {
    // Given
    const organizationUserId = randomUUID();
    const command = new ActivateOrganizationUserCommand(organizationUserId, 1);
    organizationUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization user not found'),
    );
  });

  it('should throw error if version mismatch', async () => {
    // Given
    const organizationUserId = randomUUID();
    const command = new ActivateOrganizationUserCommand(organizationUserId, 1);

    const organizationUser = new OrganizationUser(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.active(),
      AggregateVersion.fromNumber(2),
      OrganizationUserDisplayName.fromString('Test User'),
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
