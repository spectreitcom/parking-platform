import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminIamFacade } from '../../../admin-iam/application/admin-iam.facade';
import { AppError } from '../../../../shared/errors';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly adminIamFacade: AdminIamFacade) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<string> {
    try {
      return await this.adminIamFacade.validateUser(email, password);
    } catch {
      throw new AppError('UNAUTHORIZED', 'Invalid credentials');
    }
  }
}
