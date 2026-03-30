import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/modules/email-notification/infrastructure/infrastructure.module';
import { eventHandlers } from './event-handlers';
import { AdminIamModule } from 'src/modules/admin-iam/application/admin-iam.module';

@Module({
  imports: [InfrastructureModule, AdminIamModule],
  providers: [...eventHandlers],
})
export class EmailNotificationModule {}
