import { Module } from '@nestjs/common';
import { AdminIamModule } from '../admin-iam/application/admin-iam.module';
import { ParkingModule } from '../parking/application/parking.module';
import { OrganizationModule } from '../organization/application/organization.module';
import { OrganizationUserIamModule } from '../organization-user-iam/application/organization-user-iam.module';
import { CartModule } from '../cart/application/cart.module';
import { AuthController } from './endpoints/auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ParkingFeaturesController } from './endpoints/parking-features/parking-features.controller';

@Module({
  imports: [
    AdminIamModule,
    ParkingModule,
    OrganizationModule,
    OrganizationUserIamModule,
    CartModule,
    AuthModule,
  ],
  controllers: [AuthController, ParkingFeaturesController],
})
export class AdminApiModule {}
