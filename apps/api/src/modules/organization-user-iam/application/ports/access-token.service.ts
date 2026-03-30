import { JwtPayload } from '../types';

export abstract class AccessTokenService {
  abstract createToken(organizationUserId: string): string;
  abstract verifyToken(token: string): JwtPayload | false;
}
