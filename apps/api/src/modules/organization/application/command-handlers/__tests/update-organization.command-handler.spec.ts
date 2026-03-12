import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { UpdateOrganizationCommandHandler } from '../update-organization.command-handler';
import { UpdateOrganizationCommand } from '../../commands/update-organization.command';
import { OrganizationRepository } from '../../ports/organization.repository';
import { Organization } from '../../../domain/organization';
import { AppError } from '../../../../../shared/errors';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { OrganizationId } from '../../../domain/value-objects/organization-id';
import { OrganizationName } from '../../../domain/value-objects/organization-name';
import { OrganizationAddress } from '../../../domain/value-objects/organization-address';
import { OrganizationTaxId } from '../../../domain/value-objects/organization-tax-id';

describe('UpdateOrganizationCommandHandler', () => {
  let handler: UpdateOrganizationCommandHandler;
  let organizationRepository: jest.Mocked<OrganizationRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  const organizationId = '4469736c-939e-4e6a-a236-4d221a71957c';
  const version = 1;

  const createMockOrganization = (v = version) => {
    return new Organization(
      OrganizationId.fromString(organizationId),
      OrganizationName.fromString('Test Org'),
      OrganizationAddress.fromString('Test Address'),
      OrganizationTaxId.fromString('1234567890'),
      AggregateVersion.fromNumber(v),
      [],
    );
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrganizationCommandHandler,
        {
          provide: OrganizationRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            mergeObjectContext: jest.fn(<T>(obj: T) => obj),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateOrganizationCommandHandler>(
      UpdateOrganizationCommandHandler,
    );
    organizationRepository = module.get(OrganizationRepository);
    eventPublisher = module.get(EventPublisher);
  });

  it('should update an organization', async () => {
    const organization = createMockOrganization();
    organizationRepository.findById.mockResolvedValue(organization);
    const command = new UpdateOrganizationCommand(
      organizationId,
      'New Name',
      'New Address',
      '0987654321',
      version,
    );

    const result = await handler.execute(command);

    expect(result).toBe(organizationId);
    expect(organization.getName().value).toBe('New Name');
    expect(organization.getAddress().value).toBe('New Address');
    expect(organization.getTaxId().value).toBe('0987654321');
    expect(organizationRepository.save).toHaveBeenCalledWith(organization);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(
      organization,
    );
  });

  it('should throw ENTITY_NOT_FOUND if organization does not exist', async () => {
    organizationRepository.findById.mockResolvedValue(null);
    const command = new UpdateOrganizationCommand(
      organizationId,
      'New Name',
      'New Address',
      '0987654321',
      version,
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization not found'),
    );
  });

  it('should throw CONCURRENCY error if versions do not match', async () => {
    const organization = createMockOrganization(2);
    organizationRepository.findById.mockResolvedValue(organization);
    const command = new UpdateOrganizationCommand(
      organizationId,
      'New Name',
      'New Address',
      '0987654321',
      version,
    );

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Organization with id ${organizationId} has been modified by another process`,
      ),
    );
  });
});
