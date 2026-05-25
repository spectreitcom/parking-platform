import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AppError } from 'src/shared/errors';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import { RequestUser } from '../types';
import { OrganizationFacade } from 'src/modules/organization/application/organization.facade';

@Injectable()
export class ManagerLocalStrategy extends PassportStrategy(
  Strategy,
  'manager-local',
) {
  constructor(
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
    private readonly organizationFacade: OrganizationFacade,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<RequestUser> {
    try {
      const managerUser = await this.organizationUserIamFacade.validateUser(
        email,
        password,
      );

      const organizations =
        await this.organizationFacade.getOrganizationMembersByOrganizationUserId(
          managerUser.id,
        );

      return {
        id: managerUser.id,
        organizations,
      };
    } catch {
      throw new AppError('UNAUTHORIZED', 'Invalid credentials');
    }
  }
}
