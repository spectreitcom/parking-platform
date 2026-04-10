import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from 'src/modules/user-iam/domain/events/user-created.event';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedEventHandler.name);

  constructor(private readonly prismaService: PrismaService) {}

  async handle(event: UserCreatedEvent) {
    this.logger.log('User created', event.userId);
    const { userId, email, name, provider, createdAt, updatedAt } = event;

    await this.prismaService.userRead.upsert({
      where: { userId },
      update: { email, name, provider, updatedAt },
      create: { userId, email, name, provider, createdAt, updatedAt },
    });
  }
}
