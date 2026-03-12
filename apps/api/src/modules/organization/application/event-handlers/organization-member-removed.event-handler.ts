import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrganizationMemberRemovedEvent } from '../../domain/events/organization-member-removed.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(OrganizationMemberRemovedEvent)
export class OrganizationMemberRemovedEventHandler implements IEventHandler<OrganizationMemberRemovedEvent> {
  private readonly logger = new Logger(
    OrganizationMemberRemovedEventHandler.name,
  );

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: OrganizationMemberRemovedEvent) {
    this.logger.log(`Organization member removed: ${event.memberId}`);

    const { organizationId, memberId } = event;

    const record =
      await this.prismaService.organizationListForAdmnRead.findUnique({
        where: { organizationId },
      });

    const members = record?.members as {
      id: string;
      isRoot: boolean;
      organizationUserId: string;
    }[];

    await this.prismaService.organizationListForAdmnRead.update({
      where: { organizationId },
      data: {
        members: members.filter((member) => member.id !== memberId),
      },
    });
  }
}
