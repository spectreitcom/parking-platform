import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AdminIamModule } from 'src/modules/admin-iam/application/admin-iam.module';
import { AdminLocalStrategy } from './strategies/admin-local.strategy';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

@Module({
  imports: [PassportModule, AdminIamModule],
  providers: [AdminLocalStrategy, AdminJwtStrategy],
})
export class AuthModule {}
