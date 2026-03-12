import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { AddMemberCommandHandler } from '../add-member.command-handler';
import { AddMemberCommand } from '../../commands/add-member.command';
import { OrganizationRepository } from '../../ports/organization.repository';
import { Organization } from '../../../domain/organization';
import { AppError } from '../../../../../shared/errors';
import { randomUUID } from 'node:crypto';

describe('AddMemberCommandHandler', () => {
  let handler: AddMemberCommandHandler;
  let organizationRepository: jest.Mocked<OrganizationRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddMemberCommandHandler,
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

    handler = module.get<AddMemberCommandHandler>(AddMemberCommandHandler);
    organizationRepository = module.get(OrganizationRepository);
    eventPublisher = module.get(EventPublisher);
  });

  it('should add a member to an organization', async () => {
    const organizationId = randomUUID();
    const organization = Organization.create('Test Org', 'Address', '123');
    // Force ID for testing if possible, but Organization.create generates a random one.
    // We'll just use the one it generated.
    const orgId = organization.getId().value;
    const version = organization.getVersion().value;

    organizationRepository.findById.mockResolvedValue(organization);

    const command = new AddMemberCommand(orgId, false, randomUUID(), version);

    const result = await handler.execute(command);

    expect(result).toBe(orgId);
    expect(organizationRepository.save).toHaveBeenCalledWith(organization);
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalledWith(
      organization,
    );
  });

  it('should throw error if organization not found', async () => {
    organizationRepository.findById.mockResolvedValue(null);

    const command = new AddMemberCommand(randomUUID(), false, randomUUID(), 1);

    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization not found'),
    );
  });

  it('should throw error if version mismatch', async () => {
    const organization = Organization.create('Test Org', 'Address', '123');
    organizationRepository.findById.mockResolvedValue(organization);

    const command = new AddMemberCommand(
      organization.getId().value,
      false,
      randomUUID(),
      999, // Wrong version
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: 'CONCURRENCY',
      }),
    );
  });

  it('should throw validation error if domain logic fails', async () => {
    const organization = Organization.create('Test Org', 'Address', '123');
    const userId = randomUUID();
    organization.addMember(true, userId); // Add root member

    organizationRepository.findById.mockResolvedValue(organization);

    const command = new AddMemberCommand(
      organization.getId().value,
      true, // Try to add another root member
      randomUUID(),
      organization.getVersion().value,
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
      }),
    );
  });
});
