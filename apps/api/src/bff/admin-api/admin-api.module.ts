import { Module } from '@nestjs/common';
import { AdminIamModule } from 'src/modules/admin-iam/application/admin-iam.module';
import { ParkingModule } from 'src/modules/parking/application/parking.module';
import { OrganizationModule } from 'src/modules/organization/application/organization.module';
import { OrganizationUserIamModule } from 'src/modules/organization-user-iam/application/organization-user-iam.module';
import { CartModule } from 'src/modules/cart/application/cart.module';
import { UserIamModule } from 'src/modules/user-iam/application/user-iam.module';
import { AuthController } from './endpoints/auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ParkingFeaturesController } from './endpoints/parking-features/parking-features.controller';
import { PlaceTypesController } from './endpoints/place-types/place-types.controller';
import { ParkingAddonsController } from './endpoints/parking-addons/parking-addons.controller';
import { AdminsController } from './endpoints/admins/admins.controller';
import { OrganizationsController } from './endpoints/organizations/organizations.controller';
import { ParkingsController } from './endpoints/parkings/parkings.controller';
import { OrganizationUsersController } from './endpoints/organization-users/organization-users.controller';
import { PlacesController } from './endpoints/places/places.controller';
import { UsersController } from './endpoints/users/users.controller';
import { ReservationsController } from './endpoints/reservations/reservations.controller';
import { ReservationModule } from 'src/modules/reservation/application/reservation.module';

@Module({
  imports: [
    AdminIamModule,
    ParkingModule,
    OrganizationModule,
    OrganizationUserIamModule,
    CartModule,
    UserIamModule,
    AuthModule,
    ReservationModule,
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
    UsersController,
    ReservationsController,
  ],
})
export class AdminApiModule {}
