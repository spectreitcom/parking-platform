import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, RequestUser } from '../types';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    configService: ConfigService,
    private readonly adminIamFacade: AdminIamFacade,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ADMIN_JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const adminUserId = payload.sub;
    const adminUser = await this.adminIamFacade.getAdminUserById(adminUserId);
    return {
      id: adminUser.id,
      isSuperAdmin: adminUser.isSuperAdmin,
    };
  }
}
