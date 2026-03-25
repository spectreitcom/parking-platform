import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, RequestUser } from '../types';
import { AdminIamFacade } from '../../../admin-iam/application/admin-iam.facade';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly adminIamFacade: AdminIamFacade,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
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
