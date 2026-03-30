import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { OrganizationUserRepository } from '../application/ports/organization-user.repository';
import { PrismaOrganizationUserRepository } from './persistence/prisma-organization-user.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshTokenService } from '../application/ports/refresh-token.service';
import { JwtRefreshTokenService } from './tokens/jwt-refresh-token.service';
import { RefreshTokenStorage } from '../application/ports/refresh-token.storage';
import { RedisRefreshTokenStorage } from './storages/redis-refresh-token.storage';
import { OrganizationUserStatusMapperService } from '../application/ports/organization-user-status-mapper.service';
import { AppOrganizationUserStatusMapperService } from './services/app-organization-user-status-mapper.service';
import { PasswordService } from '../application/ports/password.service';
import { Argon2PasswordService } from './services/argon-2-password.service';
import { ResetPasswordTokenStorage } from '../application/ports/reset-password-token.storage';
import { RedisResetPasswordTokenStorage } from './storages/redis-reset-password-token.storage';
import { ResetPasswordTokenService } from '../application/ports/reset-password-token.service';
import { AppResetPasswordTokenService } from './tokens/app-reset-password-token.service';
import { AccessTokenService } from '../application/ports/access-token.service';
import { JwtAccessTokenService } from './tokens/jwt-access-token.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: OrganizationUserRepository,
      useClass: PrismaOrganizationUserRepository,
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
      provide: OrganizationUserStatusMapperService,
      useClass: AppOrganizationUserStatusMapperService,
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
    {
      provide: AccessTokenService,
      useClass: JwtAccessTokenService,
    },
  ],
  exports: [
    OrganizationUserRepository,
    RefreshTokenService,
    RefreshTokenStorage,
    OrganizationUserStatusMapperService,
    PasswordService,
    ResetPasswordTokenStorage,
    ResetPasswordTokenService,
    AccessTokenService,
  ],
})
export class InfrastructureModule {}
