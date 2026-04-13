import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, RequestUser } from '../types';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userIamFacade: UserIamFacade,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const userId = payload.sub;

    try {
      const user = await this.userIamFacade.getUserById(userId);
      return {
        id: user.id,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
