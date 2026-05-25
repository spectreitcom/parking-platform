import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './endpoints/auth/auth.controller';
import { OrganizationUserIamModule } from 'src/modules/organization-user-iam/application/organization-user-iam.module';
import { ParkingsController } from './endpoints/parkings/parkings.controller';
import { ParkingModule } from 'src/modules/parking/application/parking.module';
import { OrganizationModule } from 'src/modules/organization/application/organization.module';

@Module({
  imports: [
    AuthModule,
    OrganizationUserIamModule,
    ParkingModule,
    OrganizationModule,
  ],
  controllers: [AuthController, ParkingsController],
})
export class ManagerApiModule {}
