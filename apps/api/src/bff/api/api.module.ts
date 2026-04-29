import { Module } from '@nestjs/common';
import { UserIamModule } from 'src/modules/user-iam/application/user-iam.module';
import { AuthController } from './endpoints/auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ReservationModule } from 'src/modules/reservation/application/reservation.module';
import { ReservationsController } from './endpoints/reservations/reservations.controller';
import { ParkingModule } from 'src/modules/parking/application/parking.module';

@Module({
  imports: [UserIamModule, AuthModule, ReservationModule, ParkingModule],
  controllers: [AuthController, ReservationsController],
})
export class ApiModule {}
