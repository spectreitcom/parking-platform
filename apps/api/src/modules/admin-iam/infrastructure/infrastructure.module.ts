import { Module } from '@nestjs/common';
import { AdminUserRepository } from '../application/ports/admin-user.repository';
import { PrismaAdminUserRepository } from './persistence/prisma-admin-user.repository';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessTokenService } from '../application/ports/access-token.service';
import { JwtAccessTokenService } from './tokens/jwt-access-token.service';
import { RefreshTokenService } from '../application/ports/refresh-token.service';
import { JwtRefreshTokenService } from './tokens/jwt-refresh-token.service';
import { RefreshTokenStorage } from '../application/ports/refresh-token.storage';
import { RedisRefreshTokenStorage } from './storages/redis-refresh-token.storage';

@Module({
  imports: [
    PrismaModule,
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
      provide: AdminUserRepository,
      useClass: PrismaAdminUserRepository,
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
  ],
  exports: [
    AdminUserRepository,
    AccessTokenService,
    RefreshTokenService,
    RefreshTokenStorage,
  ],
})
export class InfrastructureModule {}
