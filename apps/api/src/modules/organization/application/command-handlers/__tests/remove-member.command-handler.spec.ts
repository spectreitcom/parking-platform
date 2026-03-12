import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { RemoveMemberCommandHandler } from '../remove-member.command-handler';
import { OrganizationRepository } from '../../ports/organization.repository';
import { RemoveMemberCommand } from '../../commands/remove-member.command';
import { Organization } from '../../../domain/organization';
import { OrganizationId } from '../../../domain/value-objects/organization-id';
import { OrganizationName } from '../../../domain/value-objects/organization-name';
import { OrganizationAddress } from '../../../domain/value-objects/organization-address';
import { OrganizationTaxId } from '../../../domain/value-objects/organization-tax-id';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { OrganizationMember } from '../../../domain/entities/organization-member';
import { OrganizationMemberId } from '../../../domain/value-objects/organization-member-id';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { AppError } from '../../../../../shared/errors';

describe('RemoveMemberCommandHandler', () => {
  let handler: RemoveMemberCommandHandler;
  let organizationRepository: jest.Mocked<OrganizationRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    organizationRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as typeof organizationRepository;

    eventPublisher = {
      mergeObjectContext: jest.fn(<T>(obj: T) => obj),
    } as unknown as typeof eventPublisher;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveMemberCommandHandler,
        {
          provide: OrganizationRepository,
          useValue: organizationRepository,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisher,
        },
      ],
    }).compile();

    handler = module.get<RemoveMemberCommandHandler>(
      RemoveMemberCommandHandler,
    );
  });

  it('should remove member successfully', async () => {
    // Given
    const organizationId = randomUUID();
    const memberId = randomUUID();
    const version = 1;
    const command = new RemoveMemberCommand(organizationId, memberId, version);

    const member = new OrganizationMember(
      OrganizationMemberId.fromString(memberId),
      false,
      OrganizationUserId.fromString(randomUUID()),
    );

    const organization = Organization.reconstruct(
      OrganizationId.fromString(organizationId),
      OrganizationName.fromString('Test Org'),
      OrganizationAddress.fromString('Test Address'),
      OrganizationTaxId.fromString('1234567890'),
      AggregateVersion.fromNumber(version),
      [member],
    );

    organizationRepository.findById.mockResolvedValue(organization);
    const commitSpy = jest.spyOn(organization, 'commit');

    // When
    const result = await handler.execute(command);

    // Then
    expect(organizationRepository.findById).toHaveBeenCalledWith(
      organizationId,
    );
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(
      organization,
    );
    expect(organization.getMembers().length).toBe(0);
    expect(organizationRepository.save).toHaveBeenCalledWith(organization);
    expect(commitSpy).toHaveBeenCalled();
    expect(result).toBe(organizationId);
  });

  it('should throw error if organization not found', async () => {
    // Given
    const organizationId = randomUUID();
    const command = new RemoveMemberCommand(organizationId, randomUUID(), 1);

    organizationRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization not found'),
    );
  });

  it('should throw error if version mismatch', async () => {
    // Given
    const organizationId = randomUUID();
    const command = new RemoveMemberCommand(organizationId, randomUUID(), 1);

    const organization = Organization.reconstruct(
      OrganizationId.fromString(organizationId),
      OrganizationName.fromString('Test Org'),
      OrganizationAddress.fromString('Test Address'),
      OrganizationTaxId.fromString('1234567890'),
      AggregateVersion.fromNumber(2),
      [],
    );

    organizationRepository.findById.mockResolvedValue(organization);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Organization with id ${organizationId} has been modified by another process`,
      ),
    );
  });

  it('should throw error if member not found', async () => {
    // Given
    const organizationId = randomUUID();
    const memberId = randomUUID();
    const command = new RemoveMemberCommand(organizationId, memberId, 1);

    const organization = Organization.reconstruct(
      OrganizationId.fromString(organizationId),
      OrganizationName.fromString('Test Org'),
      OrganizationAddress.fromString('Test Address'),
      OrganizationTaxId.fromString('1234567890'),
      AggregateVersion.fromNumber(1),
      [],
    );

    organizationRepository.findById.mockResolvedValue(organization);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('VALIDATION_ERROR', 'Member not found'),
    );
  });
});
