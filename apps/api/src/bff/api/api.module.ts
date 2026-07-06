import { Module } from '@nestjs/common';
import { UserIamModule } from 'src/modules/user-iam/application/user-iam.module';
import { AuthController } from './endpoints/auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ReservationModule } from 'src/modules/reservation/application/reservation.module';
import { ReservationsController } from './endpoints/reservations/reservations.controller';
import { ParkingModule } from 'src/modules/parking/application/parking.module';
import { RegisterUserHandler } from './endpoints/auth/handlers/register-user.handler';
import { SignInHandler } from './endpoints/auth/handlers/sign-in.handler';
import { GetMeHandler } from './endpoints/auth/handlers/get-me.handler';
import { SignOutHandler } from './endpoints/auth/handlers/sign-out.handler';
import { RequestResetPasswordTokenHandler } from './endpoints/auth/handlers/request-reset-password-token.handler';
import { ResetPasswordHandler } from './endpoints/auth/handlers/reset-password.handler';
import { ChangePasswordHandler } from './endpoints/auth/handlers/change-password.handler';
import { RefreshTokenHandler } from './endpoints/auth/handlers/refresh-token.handler';
import { CreateReservationHandler } from './endpoints/reservations/handlers/create-reservation.handler';
import { UpdateReservationHandler } from './endpoints/reservations/handlers/update-reservation.handler';
import { CancelReservationHandler } from './endpoints/reservations/handlers/cancel-reservation.handler';
import { GetReservationsListHandler } from './endpoints/reservations/handlers/get-reservations-list.handler';
import { CartModule } from 'src/modules/cart/application/cart.module';
import { CartsController } from './endpoints/carts/carts.controller';
import { GetCartHandler } from './endpoints/carts/handlers/get-cart.handler';
import { CreateCartHandler } from './endpoints/carts/handlers/create-cart.handler';
import { UpdateCartHandler } from './endpoints/carts/handlers/update-cart.handler';
import { SearchModule } from 'src/modules/search/application/search.module';
import { SearchController } from './endpoints/search/search.controller';
import { SearchHandler } from './endpoints/search/handlers/search.handler';
import { PlaceTypesController } from './endpoints/place-types/place-types.controller';
import { PlacesController } from './endpoints/places/places.controller';

@Module({
  imports: [
    UserIamModule,
    AuthModule,
    ReservationModule,
    ParkingModule,
    CartModule,
    SearchModule,
  ],
  controllers: [
    AuthController,
    ReservationsController,
    CartsController,
    SearchController,
    PlaceTypesController,
    PlacesController,
  ],
  providers: [
    RegisterUserHandler,
    SignInHandler,
    GetMeHandler,
    SignOutHandler,
    RequestResetPasswordTokenHandler,
    ResetPasswordHandler,
    ChangePasswordHandler,
    RefreshTokenHandler,
    CreateReservationHandler,
    UpdateReservationHandler,
    CancelReservationHandler,
    GetReservationsListHandler,
    GetCartHandler,
    CreateCartHandler,
    UpdateCartHandler,
    SearchHandler,
  ],
})
export class ApiModule {}
