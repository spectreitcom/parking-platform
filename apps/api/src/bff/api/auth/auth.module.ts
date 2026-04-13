import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserIamModule } from 'src/modules/user-iam/application/user-iam.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, UserIamModule],
  providers: [LocalStrategy, JwtStrategy],
})
export class AuthModule {}
