import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { UpdateOrganizationCommandHandler } from '../update-organization.command-handler';
import { OrganizationRepository } from '../../ports/organization.repository';
import { UpdateOrganizationCommand } from '../../commands/update-organization.command';
import { Organization } from '../../../domain/organization';
import { OrganizationId } from '../../../domain/value-objects/organization-id';
import { OrganizationName } from '../../../domain/value-objects/organization-name';
import { OrganizationAddress } from '../../../domain/value-objects/organization-address';
import { OrganizationTaxId } from '../../../domain/value-objects/organization-tax-id';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { AppError } from '../../../../../shared/errors';

describe('UpdateOrganizationCommandHandler', () => {
  let handler: UpdateOrganizationCommandHandler;
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
        UpdateOrganizationCommandHandler,
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

    handler = module.get<UpdateOrganizationCommandHandler>(
      UpdateOrganizationCommandHandler,
    );
  });

  it('should update organization successfully', async () => {
    // Given
    const organizationId = randomUUID();
    const version = 1;
    const command = new UpdateOrganizationCommand(
      organizationId,
      'New Name',
      'New Address',
      '1234567890',
      version,
    );

    const organization = Organization.reconstruct(
      OrganizationId.fromString(organizationId),
      OrganizationName.fromString('Old Name'),
      OrganizationAddress.fromString('Old Address'),
      OrganizationTaxId.fromString('0987654321'),
      AggregateVersion.fromNumber(version),
      [],
    );

    organizationRepository.findById.mockResolvedValue(organization);
    const commitSpy = jest.spyOn(organization, 'commit');

    // When
    const resultId = await handler.execute(command);

    // Then
    expect(organizationRepository.findById).toHaveBeenCalledWith(
      organizationId,
    );
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(
      organization,
    );
    expect(organization.getName().value).toBe('New Name');
    expect(organization.getAddress().value).toBe('New Address');
    expect(organization.getTaxId().value).toBe('1234567890');
    expect(organizationRepository.save).toHaveBeenCalledWith(organization);
    expect(commitSpy).toHaveBeenCalled();
    expect(resultId).toBe(organizationId);
  });

  it('should throw error if organization not found', async () => {
    // Given
    const organizationId = randomUUID();
    const command = new UpdateOrganizationCommand(
      organizationId,
      'New Name',
      'New Address',
      '1234567890',
      1,
    );

    organizationRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization not found'),
    );
  });

  it('should throw error if version mismatch', async () => {
    // Given
    const organizationId = randomUUID();
    const command = new UpdateOrganizationCommand(
      organizationId,
      'New Name',
      'New Address',
      '1234567890',
      1,
    );

    const organization = Organization.reconstruct(
      OrganizationId.fromString(organizationId),
      OrganizationName.fromString('Old Name'),
      OrganizationAddress.fromString('Old Address'),
      OrganizationTaxId.fromString('0987654321'),
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
});
