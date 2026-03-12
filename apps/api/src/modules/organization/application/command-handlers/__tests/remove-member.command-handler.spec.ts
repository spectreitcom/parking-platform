import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { RemoveMemberCommandHandler } from '../remove-member.command-handler';
import { RemoveMemberCommand } from '../../commands/remove-member.command';
import { OrganizationRepository } from '../../ports/organization.repository';
import { Organization } from '../../../domain/organization';
import { AppError } from '../../../../../shared/errors';
import { AggregateVersion } from '../../../../../shared/value-objects/aggregate-version';
import { OrganizationId } from '../../../domain/value-objects/organization-id';
import { OrganizationName } from '../../../domain/value-objects/organization-name';
import { OrganizationAddress } from '../../../domain/value-objects/organization-address';
import { OrganizationTaxId } from '../../../domain/value-objects/organization-tax-id';
import { OrganizationMember } from '../../../domain/entities/organization-member';
import { OrganizationMemberId } from '../../../domain/value-objects/organization-member-id';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';

describe('RemoveMemberCommandHandler', () => {
  let handler: RemoveMemberCommandHandler;
  let organizationRepository: jest.Mocked<OrganizationRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  const organizationId = '4469736c-939e-4e6a-a236-4d221a71957c';
  const memberId = 'b82d4576-9d6c-4820-94d8-795a9762495b';
  const version = 1;

  const createMockOrganization = (
    v = version,
    members: OrganizationMember[] = [],
  ) => {
    return new Organization(
      OrganizationId.fromString(organizationId),
      OrganizationName.fromString('Test Org'),
      OrganizationAddress.fromString('Test Address'),
      OrganizationTaxId.fromString('1234567890'),
      AggregateVersion.fromNumber(v),
      members,
    );
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveMemberCommandHandler,
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
            mergeObjectContext: jest.fn((obj) => obj),
          },
        },
      ],
    }).compile();

    handler = module.get<RemoveMemberCommandHandler>(
      RemoveMemberCommandHandler,
    );
    organizationRepository = module.get(OrganizationRepository);
    eventPublisher = module.get(EventPublisher);
  });

  it('should remove a member from an organization', async () => {
    const member = new OrganizationMember(
      OrganizationMemberId.fromString(memberId),
      false,
      OrganizationUserId.fromString('f7b5391d-0348-43d3-980b-980753549641'),
    );
    const organization = createMockOrganization(version, [member]);
    organizationRepository.findById.mockResolvedValue(organization);
    const command = new RemoveMemberCommand(organizationId, memberId, version);

    const result = await handler.execute(command);

    expect(result).toBe(organizationId);
    expect(organization.getMembers().length).toBe(0);
    expect(organizationRepository.save).toHaveBeenCalledWith(organization);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(
      organization,
    );
  });

  it('should throw ENTITY_NOT_FOUND if organization does not exist', async () => {
    organizationRepository.findById.mockResolvedValue(null);
    const command = new RemoveMemberCommand(organizationId, memberId, version);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization not found'),
    );
  });

  it('should throw CONCURRENCY error if versions do not match', async () => {
    const organization = createMockOrganization(2);
    organizationRepository.findById.mockResolvedValue(organization);
    const command = new RemoveMemberCommand(organizationId, memberId, version);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError(
        'CONCURRENCY',
        `Organization with id ${organizationId} has been modified by another process`,
      ),
    );
  });

  it('should throw VALIDATION_ERROR if member is not found', async () => {
    const organization = createMockOrganization();
    organizationRepository.findById.mockResolvedValue(organization);
    const command = new RemoveMemberCommand(organizationId, memberId, version);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('VALIDATION_ERROR', 'Member not found'),
    );
  });
});
