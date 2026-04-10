import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { UserRepository } from 'src/modules/user-iam/application/ports/user.repository';
import { PrismaUserRepository } from 'src/modules/user-iam/infrastructure/persistence/prisma-user.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessTokenService } from '../application/ports/access-token.service';
import { JwtAccessTokenService } from './tokens/jwt-access-token.service';
import { RefreshTokenService } from '../application/ports/refresh-token.service';
import { JwtRefreshTokenService } from './tokens/jwt-refresh-token.service';
import { RefreshTokenStorage } from '../application/ports/refresh-token.storage';
import { RedisRefreshTokenStorage } from './storages/redis-refresh-token.storage';
import { PasswordService } from '../application/ports/password.service';
import { Argon2PasswordService } from './services/argon-2-password.service';
import { ResetPasswordTokenStorage } from '../application/ports/reset-password-token.storage';
import { RedisResetPasswordTokenStorage } from './storages/redis-reset-password-token.storage';
import { ResetPasswordTokenService } from '../application/ports/reset-password-token.service';
import { AppResetPasswordTokenService } from './tokens/app-reset-password-token.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: AccessTokenService,
      useClass: JwtAccessTokenService,
    },
    {
      provide: RefreshTokenService,
      useClass: JwtRefreshTokenService,
    },
    {
      provide: RefreshTokenStorage,
      useClass: RedisRefreshTokenStorage,
    },
    {
      provide: PasswordService,
      useClass: Argon2PasswordService,
    },
    {
      provide: ResetPasswordTokenStorage,
      useClass: RedisResetPasswordTokenStorage,
    },
    {
      provide: ResetPasswordTokenService,
      useClass: AppResetPasswordTokenService,
    },
  ],
  exports: [
    UserRepository,
    AccessTokenService,
    RefreshTokenService,
    RefreshTokenStorage,
    PasswordService,
    ResetPasswordTokenStorage,
    ResetPasswordTokenService,
  ],
})
export class InfrastructureModule {}
