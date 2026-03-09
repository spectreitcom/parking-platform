import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserUpdatedEvent } from '../../domain/events/admin-user-updated.event';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@EventsHandler(AdminUserUpdatedEvent)
export class AdminUserUpdatedEventHandler implements IEventHandler<AdminUserUpdatedEvent> {
  private readonly logger = new Logger(AdminUserUpdatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: AdminUserUpdatedEvent) {
    this.logger.log(`Admin user updated: ${event.id}`);
    const { id, updatedAt, isSuperAdmin, status, email, displayName } = event;

    await this.prismaService.adminUserRead.update({
      where: { adminUserId: id },
      data: { updatedAt, isSuperAdmin, status, email, displayName },
    });
  }
}
