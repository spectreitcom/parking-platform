import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateOrganizationCommandHandler } from '../create-organization.command-handler';
import { CreateOrganizationCommand } from '../../commands/create-organization.command';
import { OrganizationRepository } from '../../ports/organization.repository';
import { Organization } from '../../../domain/organization';

describe('CreateOrganizationCommandHandler', () => {
  let handler: CreateOrganizationCommandHandler;
  let organizationRepository: jest.Mocked<OrganizationRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrganizationCommandHandler,
        {
          provide: OrganizationRepository,
          useValue: {
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

    handler = module.get<CreateOrganizationCommandHandler>(
      CreateOrganizationCommandHandler,
    );
    organizationRepository = module.get(OrganizationRepository);
    eventPublisher = module.get(EventPublisher);
  });

  it('should create an organization', async () => {
    const command = new CreateOrganizationCommand(
      'Test Org',
      'Test Address',
      '1234567890',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(organizationRepository.save).toHaveBeenCalledWith(
      expect.any(Organization),
      { isNew: true },
    );
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalled();
  });
});
