import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, RequestUser } from '../types';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';

@Injectable()
export class ManagerJwtStrategy extends PassportStrategy(
  Strategy,
  'manager-jwt',
) {
  constructor(
    configService: ConfigService,
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
    private readonly organizationFacade: OrganizationFacade,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ADMIN_JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const managerUserId = payload.sub;
    const managerUser =
      await this.organizationUserIamFacade.getOrganizationUserById(
        managerUserId,
      );

    const organizations =
      await this.organizationFacade.getOrganizationMembersByOrganizationUserId(
        managerUserId,
      );

    return {
      id: managerUser.organizationUserId,
      organizations,
    };
  }
}
