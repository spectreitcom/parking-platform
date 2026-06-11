import { Test, TestingModule } from '@nestjs/testing';
import { ResendOrganizationUserInvitationCommandHandler } from '../resend-organization-user-invitation.command-handler';
import { OrganizationUserRepository } from '../../ports/organization-user.repository';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ResendOrganizationUserInvitationCommand } from '../../commands/resend-organization-user-invitation.command';
import { OrganizationUserId } from '../../../domain/value-objects/organization-user-id';
import { OrganizationUser } from '../../../domain/organization-user';
import { AppError } from 'src/shared/errors';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';

describe('ResendOrganizationUserInvitationCommandHandler', () => {
  let handler: ResendOrganizationUserInvitationCommandHandler;
  let organizationUserRepository: jest.Mocked<OrganizationUserRepository>;
  let outboxService: jest.Mocked<OutboxService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    organizationUserRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<OrganizationUserRepository>;

    outboxService = {
      enqueue: jest.fn(),
    } as unknown as jest.Mocked<OutboxService>;

    prismaService = {} as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendOrganizationUserInvitationCommandHandler,
        {
          provide: OrganizationUserRepository,
          useValue: organizationUserRepository,
        },
        {
          provide: OutboxService,
          useValue: outboxService,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    handler = module.get<ResendOrganizationUserInvitationCommandHandler>(
      ResendOrganizationUserInvitationCommandHandler,
    );
  });

  it('should resend organization user invitation successfully', async () => {
    // Given
    const organizationUserId = 'd3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3';
    const command = new ResendOrganizationUserInvitationCommand(
      organizationUserId,
    );

    const organizationUser = OrganizationUser.invite(
      'test@example.com',
      'Test User',
    );
    jest
      .spyOn(organizationUser, 'getId')
      .mockReturnValue(OrganizationUserId.fromString(organizationUserId));

    organizationUserRepository.findById.mockResolvedValue(organizationUser);

    // When
    await handler.execute(command);

    // Then
    expect(organizationUserRepository.findById).toHaveBeenCalledWith(
      organizationUserId,
    );
    expect(outboxService.enqueue).toHaveBeenCalledWith(
      expect.any(IntegrationEvent),
      { deduplicate: false },
      prismaService,
    );

    const event = outboxService.enqueue.mock.calls[0][0] as IntegrationEvent<
      Record<string, unknown>,
      string
    >;
    expect(event.type).toBe(
      'organization-user-iam.organization-user.invited.v1',
    );
    expect(event.payload).toEqual({
      email: 'test@example.com',
      displayName: 'Test User',
      organizationUserId: organizationUserId,
    });
    expect(event.boundedContext).toBe('organization-user-iam');
    expect(event.aggregateType).toBe('OrganizationUser');
    expect(event.aggregateId).toBe(organizationUserId);
  });

  it('should throw error if organization user does not exist', async () => {
    // Given
    const organizationUserId = 'non-existent-id';
    const command = new ResendOrganizationUserInvitationCommand(
      organizationUserId,
    );

    organizationUserRepository.findById.mockResolvedValue(null);

    // When & Then
    await expect(handler.execute(command)).rejects.toThrow(
      new AppError('ENTITY_NOT_FOUND', 'Organization user not found'),
    );
  });
});
