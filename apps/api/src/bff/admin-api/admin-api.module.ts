import { Module } from '@nestjs/common';
import { AdminIamModule } from '../../modules/admin-iam/application/admin-iam.module';
import { ParkingModule } from '../../modules/parking/application/parking.module';
import { OrganizationModule } from '../../modules/organization/application/organization.module';
import { OrganizationUserIamModule } from '../../modules/organization-user-iam/application/organization-user-iam.module';
import { CartModule } from '../../modules/cart/application/cart.module';
import { AuthController } from './endpoints/auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ParkingFeaturesController } from './endpoints/parking-features/parking-features.controller';
import { PlaceTypesController } from './endpoints/place-types/place-types.controller';
import { ParkingAddonsController } from './endpoints/parking-addons/parking-addons.controller';
import { AdminsController } from 'src/bff/admin-api/endpoints/admins/admins.controller';
import { OrganizationsController } from 'src/bff/admin-api/endpoints/organizations/organizations.controller';
import { ParkingsController } from 'src/bff/admin-api/endpoints/parkings/parkings.controller';
import { OrganizationUsersController } from './endpoints/organization-users/organization-users.controller';
import { PlacesController } from 'src/bff/admin-api/endpoints/places/places.controller';

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
    PlacesController,
  ],
})
export class AdminApiModule {}
