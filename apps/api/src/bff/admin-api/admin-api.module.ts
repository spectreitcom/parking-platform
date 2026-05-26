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
import { GetAdminParkingByIdHandler } from './endpoints/parkings/handlers/get-admin-parking-by-id.handler';
import { GetAdminParkingListHandler } from './endpoints/parkings/handlers/get-admin-parking-list.handler';
import { CreateAdminParkingHandler } from './endpoints/parkings/handlers/create-admin-parking.handler';
import { UpdateAdminParkingHandler } from './endpoints/parkings/handlers/update-admin-parking.handler';
import { ActivateAdminParkingHandler } from './endpoints/parkings/handlers/activate-admin-parking.handler';
import { DeactivateAdminParkingHandler } from './endpoints/parkings/handlers/deactivate-admin-parking.handler';
import { AdminSignInHandler } from './endpoints/auth/handlers/admin-sign-in.handler';
import { GetAdminMeHandler } from './endpoints/auth/handlers/get-admin-me.handler';
import { AdminSignOutHandler } from './endpoints/auth/handlers/admin-sign-out.handler';
import { AdminRequestResetPasswordTokenHandler } from './endpoints/auth/handlers/admin-request-reset-password-token.handler';
import { AdminResetPasswordHandler } from './endpoints/auth/handlers/admin-reset-password.handler';
import { AdminChangePasswordHandler } from './endpoints/auth/handlers/admin-change-password.handler';
import { AdminRefreshTokenHandler } from './endpoints/auth/handlers/admin-refresh-token.handler';
import { SearchOrganizationUsersHandler } from './endpoints/organizations/handlers/search-organization-users.handler';
import { GetOrganizationListHandler } from './endpoints/organizations/handlers/get-organization-list.handler';
import { GetOrganizationByIdHandler } from './endpoints/organizations/handlers/get-organization-by-id.handler';
import { CreateOrganizationHandler } from './endpoints/organizations/handlers/create-organization.handler';
import { UpdateOrganizationHandler } from './endpoints/organizations/handlers/update-organization.handler';
import { AddMemberToOrganizationHandler } from './endpoints/organizations/handlers/add-member-to-organization.handler';
import { RemoveMemberFromOrganizationHandler } from './endpoints/organizations/handlers/remove-member-from-organization.handler';
import { GetParkingFeaturesListHandler } from './endpoints/parking-features/handlers/get-parking-features-list.handler';
import { GetParkingFeatureByIdHandler } from './endpoints/parking-features/handlers/get-parking-feature-by-id.handler';
import { CreateParkingFeatureHandler } from './endpoints/parking-features/handlers/create-parking-feature.handler';
import { UpdateParkingFeatureHandler } from './endpoints/parking-features/handlers/update-parking-feature.handler';
import { DeleteParkingFeatureHandler } from './endpoints/parking-features/handlers/delete-parking-feature.handler';
import { GetAdminReservationsListHandler } from './endpoints/reservations/handlers/get-admin-reservations-list.handler';
import { GetAdminsListHandler } from './endpoints/admins/handlers/get-admins-list.handler';
import { InviteAdminHandler } from './endpoints/admins/handlers/invite-admin.handler';
import { SuspendAdminUserHandler } from './endpoints/admins/handlers/suspend-admin-user.handler';
import { ActivateAdminUserHandler } from './endpoints/admins/handlers/activate-admin-user.handler';
import { ParkingSpotsController } from './endpoints/parking-spots/parking-spots.controller';
import { GetParkingSpotsHandler } from './endpoints/parking-spots/handlers/get-parking-spots.handler';

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
    ParkingSpotsController,
  ],
  providers: [
    GetAdminParkingByIdHandler,
    GetAdminParkingListHandler,
    CreateAdminParkingHandler,
    UpdateAdminParkingHandler,
    ActivateAdminParkingHandler,
    DeactivateAdminParkingHandler,
    AdminSignInHandler,
    GetAdminMeHandler,
    AdminSignOutHandler,
    AdminRequestResetPasswordTokenHandler,
    AdminResetPasswordHandler,
    AdminChangePasswordHandler,
    AdminRefreshTokenHandler,
    SearchOrganizationUsersHandler,
    GetOrganizationListHandler,
    GetOrganizationByIdHandler,
    CreateOrganizationHandler,
    UpdateOrganizationHandler,
    AddMemberToOrganizationHandler,
    RemoveMemberFromOrganizationHandler,
    GetParkingFeaturesListHandler,
    GetParkingFeatureByIdHandler,
    CreateParkingFeatureHandler,
    UpdateParkingFeatureHandler,
    DeleteParkingFeatureHandler,
    GetAdminReservationsListHandler,
    GetAdminsListHandler,
    InviteAdminHandler,
    SuspendAdminUserHandler,
    ActivateAdminUserHandler,
    GetParkingSpotsHandler,
  ],
})
export class AdminApiModule {}
