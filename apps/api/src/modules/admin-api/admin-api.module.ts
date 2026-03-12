import { Module } from '@nestjs/common';
import { AdminIamModule } from '../admin-iam/application/admin-iam.module';
import { ParkingModule } from '../parking/application/parking.module';
import { OrganizationModule } from '../organization/application/organization.module';
import { OrganizationUserIamModule } from '../organization-user-iam/application/organization-user-iam.module';

@Module({
  imports: [
    AdminIamModule,
    ParkingModule,
    OrganizationModule,
    OrganizationUserIamModule,
  ],
})
export class AdminApiModule {}
