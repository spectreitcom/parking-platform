import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserInvitedEvent } from '../../domain/events/admin-user-invited.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(AdminUserInvitedEvent)
export class AdminUserInvitedEventHandler implements IEventHandler<AdminUserInvitedEvent> {
  private readonly logger = new Logger(AdminUserInvitedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: AdminUserInvitedEvent) {
    this.logger.log(`Admin user invited: ${event.id}`);
    const {
      id,
      email,
      isSuperAdmin,
      status,
      updatedAt,
      displayName,
      createdAt,
    } = event;
    await this.prismaService.adminUserRead.upsert({
      where: { adminUserId: id },
      create: {
        adminUserId: id,
        updatedAt,
        status,
        email,
        createdAt,
        isSuperAdmin,
        displayName,
      },
      update: {
        updatedAt,
        status,
        email,
        displayName,
        isSuperAdmin,
      },
    });
  }
}
