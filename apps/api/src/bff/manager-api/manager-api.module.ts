import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './endpoints/auth/auth.controller';
import { OrganizationUserIamModule } from 'src/modules/organization-user-iam/application/organization-user-iam.module';
import { ParkingsController } from './endpoints/parkings/parkings.controller';
import { ParkingModule } from 'src/modules/parking/application/parking.module';
import { OrganizationModule } from 'src/modules/organization/application/organization.module';
import { ParkingSpotsController } from './endpoints/parking-spots/parking-spots.controller';
import { AddParkingSpotHandler } from './endpoints/parking-spots/handlers/add-parking-spot.handler';
import { GetParkingsListHandler } from './endpoints/parkings/handlers/get-parkings-list.handler';
import { GetParkingDetailsHandler } from './endpoints/parkings/handlers/get-parking-details.handler';
import { GetManagerMeHandler } from './endpoints/auth/handlers/get-manager-me.handler';
import { ManagerSignInHandler } from './endpoints/auth/handlers/manager-sign-in.handler';
import { ManagerRefreshTokenHandler } from './endpoints/auth/handlers/manager-refresh-token.handler';
import { ManagerRequestResetPasswordTokenHandler } from './endpoints/auth/handlers/manager-request-reset-password-token.handler';
import { ManagerSignOutHandler } from './endpoints/auth/handlers/manager-sign-out.handler';
import { ManagerResetPasswordHandler } from './endpoints/auth/handlers/manager-reset-password.handler';
import { ManagerChangePasswordHandler } from './endpoints/auth/handlers/manager-change-password.handler';
import { UpdateParkingSpotHandler } from './endpoints/parking-spots/handlers/update-parking-spot.handler';
import { ParkingFeaturesController } from './endpoints/parking-features/parking-features.controller';
import { GetParkingFeaturesListHandler } from './endpoints/parking-features/handlers/get-parking-features-list.handler';
import { GetParkingSpotsHandler } from './endpoints/parking-spots/handlers/get-parking-spots.handler';
import { AssetsController } from './endpoints/assets/assets.controller';
import { AssetModule } from 'src/modules/asset/application/asset.module';
import { UpdateParkingHandler } from './endpoints/parkings/handlers/update-parking.handler';

@Module({
  imports: [
    AuthModule,
    OrganizationUserIamModule,
    ParkingModule,
    OrganizationModule,
    AssetModule,
  ],
  controllers: [
    AuthController,
    ParkingsController,
    ParkingSpotsController,
    ParkingFeaturesController,
    AssetsController,
  ],
  providers: [
    AddParkingSpotHandler,
    GetParkingsListHandler,
    GetParkingDetailsHandler,
    GetManagerMeHandler,
    ManagerSignInHandler,
    ManagerRefreshTokenHandler,
    ManagerRequestResetPasswordTokenHandler,
    ManagerSignOutHandler,
    ManagerResetPasswordHandler,
    ManagerChangePasswordHandler,
    UpdateParkingSpotHandler,
    GetParkingFeaturesListHandler,
    GetParkingSpotsHandler,
    UpdateParkingHandler,
  ],
})
export class ManagerApiModule {}
