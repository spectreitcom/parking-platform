import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResendOrganizationUserInvitationCommand } from '../commands/resend-organization-user-invitation.command';
import { OutboxService } from 'src/shared/outbox/outbox.service';
import { OrganizationUserRepository } from '../ports/organization-user.repository';
import { AppError } from 'src/shared/errors';
import { IntegrationEvent } from 'src/shared/outbox/outbox.types';
import {
  OrganizationUserIamIntegrationEventTypes,
  OrganizationUserIamOrganizationUserInvitedV1Payload,
} from '@repo/api-contracts';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@CommandHandler(ResendOrganizationUserInvitationCommand)
export class ResendOrganizationUserInvitationCommandHandler implements ICommandHandler<
  ResendOrganizationUserInvitationCommand,
  void
> {
  constructor(
    private readonly outboxService: OutboxService,
    private readonly organizationUserRepository: OrganizationUserRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(
    command: ResendOrganizationUserInvitationCommand,
  ): Promise<void> {
    const { organizationUserId } = command;

    const organizationUser =
      await this.organizationUserRepository.findById(organizationUserId);

    if (!organizationUser) {
      throw new AppError('ENTITY_NOT_FOUND', 'Organization user not found');
    }

    const event = new IntegrationEvent<
      OrganizationUserIamOrganizationUserInvitedV1Payload,
      OrganizationUserIamIntegrationEventTypes
    >(
      'organization-user-iam.organization-user.invited.v1',
      {
        email: organizationUser.getEmail().value,
        displayName: organizationUser.getDisplayName().value,
        organizationUserId: organizationUser.getId().value,
      },
      'organization-user-iam',
      'OrganizationUser',
      organizationUser.getId().value,
    );

    await this.outboxService.enqueue(
      event,
      { deduplicate: false },
      this.prismaService,
    );
  }
}
