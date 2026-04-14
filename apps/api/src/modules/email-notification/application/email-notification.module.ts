import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/modules/email-notification/infrastructure/infrastructure.module';
import { eventHandlers } from './event-handlers';
import { AdminIamModule } from 'src/modules/admin-iam/application/admin-iam.module';
import { OrganizationUserIamModule } from 'src/modules/organization-user-iam/application/organization-user-iam.module';
import { UserIamModule } from 'src/modules/user-iam/application/user-iam.module';

@Module({
  imports: [
    InfrastructureModule,
    AdminIamModule,
    OrganizationUserIamModule,
    UserIamModule,
  ],
  providers: [...eventHandlers],
})
export class EmailNotificationModule {}
