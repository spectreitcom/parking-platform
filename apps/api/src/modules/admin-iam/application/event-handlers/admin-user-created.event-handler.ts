import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AdminUserCreatedEvent } from '../../domain/events/admin-user-created.event';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(AdminUserCreatedEvent)
export class AdminUserCreatedEventHandler implements IEventHandler<AdminUserCreatedEvent> {
  private readonly logger = new Logger(AdminUserCreatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: AdminUserCreatedEvent) {
    this.logger.log(`Admin user created: ${event.id}`);
    const {
      id,
      isSuperAdmin,
      status,
      email,
      displayName,
      createdAt,
      updatedAt,
    } = event;
    await this.prismaService.adminUserRead.upsert({
      where: { adminUserId: id },
      update: {
        isSuperAdmin,
        status,
        email,
        displayName,
        createdAt,
        updatedAt,
      },
      create: {
        adminUserId: id,
        isSuperAdmin,
        status,
        email,
        displayName,
        createdAt,
        updatedAt,
      },
    });
  }
}
