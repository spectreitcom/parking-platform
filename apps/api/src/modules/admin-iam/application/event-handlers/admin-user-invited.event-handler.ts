import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserInvitedEvent } from '../../domain/events/admin-user-invited.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';
import { AdminStatus } from '../../domain/value-objects/admin-status';

@EventsHandler(AdminUserInvitedEvent)
export class AdminUserInvitedEventHandler implements IEventHandler<AdminUserInvitedEvent> {
  private readonly logger = new Logger(AdminUserInvitedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: AdminUserInvitedEvent) {
    this.logger.log(`Admin user invited: ${event.id}`);
    const { id, updatedAt } = event;
    await this.prismaService.adminUserRead.update({
      where: { adminUserId: id },
      data: { updatedAt, status: AdminStatus.invited().value },
    });
  }
}
