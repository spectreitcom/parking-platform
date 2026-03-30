import { Module } from '@nestjs/common';
import { AdminIamModule } from '../admin-iam/application/admin-iam.module';
import { ParkingModule } from '../parking/application/parking.module';
import { OrganizationModule } from '../organization/application/organization.module';
import { OrganizationUserIamModule } from '../organization-user-iam/application/organization-user-iam.module';
import { CartModule } from '../cart/application/cart.module';
import { AuthController } from './endpoints/auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ParkingFeaturesController } from './endpoints/parking-features/parking-features.controller';
import { PlaceTypesController } from './endpoints/place-types/place-types.controller';
import { ParkingAddonsController } from './endpoints/parking-addons/parking-addons.controller';
import { AdminsController } from 'src/modules/admin-api/endpoints/admins/admins.controller';
import { OrganizationsController } from 'src/modules/admin-api/endpoints/organizations/organizations.controller';
import { ParkingsController } from 'src/modules/admin-api/endpoints/parkings/parkings.controller';
import { OrganizationUsersController } from './endpoints/organization-users/organization-users.controller';

@Module({
  imports: [
    AdminIamModule,
    ParkingModule,
    OrganizationModule,
    OrganizationUserIamModule,
    CartModule,
    AuthModule,
  ],
  controllers: [
    AuthController,
    ParkingFeaturesController,
    PlaceTypesController,
    ParkingAddonsController,
    AdminsController,
    OrganizationsController,
    ParkingsController,
    OrganizationUsersController,
  ],
})
export class AdminApiModule {}
