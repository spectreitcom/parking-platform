import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { AppError } from 'src/shared/errors';
import { RequestUser } from '../types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userIamFacade: UserIamFacade) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<RequestUser> {
    try {
      const user = await this.userIamFacade.validateUser(email, password);
      return {
        id: user.id,
      };
    } catch {
      throw new AppError('UNAUTHORIZED', 'Invalid credentials');
    }
  }
}
