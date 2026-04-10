import { Module } from '@nestjs/common';
import { UserIamModule } from 'src/modules/user-iam/application/user-iam.module';
import { AuthController } from 'src/bff/api/endpoints/auth/auth.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserIamModule, AuthModule],
  controllers: [AuthController],
})
export class ApiModule {}
