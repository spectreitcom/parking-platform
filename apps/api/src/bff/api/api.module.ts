import { Module } from '@nestjs/common';
import { UserIamModule } from 'src/modules/user-iam/application/user-iam.module';
import { AuthController } from './endpoints/auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ReservationModule } from 'src/modules/reservation/application/reservation.module';
import { ReservationsController } from './endpoints/reservations/reservations.controller';

@Module({
  imports: [UserIamModule, AuthModule, ReservationModule],
  controllers: [AuthController, ReservationsController],
})
export class ApiModule {}
