import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { AppError } from 'src/shared/errors';
import { RequestUser } from 'src/bff/admin-api/auth/types';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(
  Strategy,
  'admin-local',
) {
  constructor(private readonly adminIamFacade: AdminIamFacade) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<RequestUser> {
    try {
      const adminUser = await this.adminIamFacade.validateUser(email, password);
      return {
        id: adminUser.id,
        isSuperAdmin: adminUser.isSuperAdmin,
      };
    } catch {
      throw new AppError('UNAUTHORIZED', 'Invalid credentials');
    }
  }
}
