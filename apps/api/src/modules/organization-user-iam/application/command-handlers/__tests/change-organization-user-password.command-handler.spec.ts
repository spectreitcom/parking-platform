import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { ChangeOrganizationUserPasswordCommandHandler } from '../change-organization-user-password.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { TransactionRunner } from '../../../../../shared/prisma/transaction-runner';
import { ChangeOrganizationUserPasswordCommand } from '../../commands/change-organization-user-password.command';
import { OrganizationUser } from '../../../domain/organization-user';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { Email } from '../../../../../shared/value-objects/email';
import { OrganizationUserStatus } from '../../../domain/value-objects/organization-user-status';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { OrganizationUserDisplayName } from '../../../domain/value-objects/organization-user-display-name';
import { AppError } from '../../../../../shared/errors';

describe('ChangeOrganizationUserPasswordCommandHandler', () => {
  let handler: ChangeOrganizationUserPasswordCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let transactionRunner: jest.Mocked<TransactionRunner>;

  beforeEach(async () => {
    organizationUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as typeof organizationUserRepository;

    eventPublisher = {
      mergeObjectContext: jest.fn(<T>(obj: T) => obj),
    } as unknown as typeof eventPublisher;

    transactionRunner = {
      runInTransaction: jest.fn((cb: (tx: string) => unknown) =>
        cb('prisma-tx'),
      ),
    } as unknown as typeof transactionRunner;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeOrganizationUserPasswordCommandHandler,
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

    handler = module.get<ChangeOrganizationUserPasswordCommandHandler>(
      ChangeOrganizationUserPasswordCommandHandler,
    );
  });

  it('should change organization user password successfully', async () => {
    // Given
    const organizationUserId = randomUUID();
    const passwordHash = 'new-password-hash';
    const version = 1;
    const command = new ChangeOrganizationUserPasswordCommand(
      organizationUserId,
      passwordHash,
      version,
    );

    const organizationUser = OrganizationUser.reconstruct(
      OrganizationUserId.fromString(organizationUserId),
      Email.fromString('test@example.com'),
      OrganizationUserStatus.active(),
      AggregateVersion.fromNumber(version),
      OrganizationUserDisplayName.fromString('Test User'),
      new Date(),
      new Date(),
    );

    organizationUserRepository.findById.mockResolvedValue(organizationUser);
    const commitSpy = jest.spyOn(organizationUser, 'commit');

    // When
    await handler.execute(command);

    // Then
    expect(transactionRunner.runInTransaction).toHaveBeenCalled();
    expect(organizationUserRepository.findById).toHaveBeenCalledWith(
      organizationUserId,
      'prisma-tx',
    );
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(
      organizationUser,
    );
    expect(organizationUser.getPasswordHash()).toBe(passwordHash);
    expect(organizationUserRepository.save).toHaveBeenCalledWith(
      organizationUser,
      {
        isNew: false,
        tx: 'prisma-tx',
      },
    );
    expect(commitSpy).toHaveBeenCalled();
  });

  it('should throw error if organization user not found', async () => {
    // Given
    const organizationUserId = randomUUID();
    const command = new ChangeOrganizationUserPasswordCommand(
      organizationUserId,
      'hash',
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
    const command = new ChangeOrganizationUserPasswordCommand(
      organizationUserId,
      'hash',
      1,
    );

    const organizationUser = OrganizationUser.reconstruct(
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
