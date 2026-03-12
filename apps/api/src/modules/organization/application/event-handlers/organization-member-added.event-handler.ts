import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrganizationMemberAddedEvent } from '../../domain/events/organization-member-added.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(OrganizationMemberAddedEvent)
export class OrganizationMemberAddedEventHandler implements IEventHandler<OrganizationMemberAddedEvent> {
  private readonly logger = new Logger(
    OrganizationMemberAddedEventHandler.name,
  );

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: OrganizationMemberAddedEvent) {
    this.logger.log(
      `Handling OrganizationMemberAddedEvent for organizationId: ${event.organizationId}`,
    );

    const { organizationId, memberId, organizationUserId, isRoot } = event;

    const record =
      await this.prismaService.organizationListForAdminRead.findUnique({
        where: { organizationId },
      });

    const members =
      (record?.members as {
        id: string;
        isRoot: boolean;
        organizationUserId: string;
      }[]) ?? [];

    members.push({
      id: memberId,
      isRoot,
      organizationUserId,
    });

    await this.prismaService.organizationListForAdminRead.update({
      where: { organizationId },
      data: {
        members,
      },
    });
  }
}
