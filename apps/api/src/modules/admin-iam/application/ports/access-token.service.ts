import { JwtPayload } from '../types';

export abstract class AccessTokenService {
  abstract createToken(adminUserId: string): string;
  abstract verifyToken(token: string): JwtPayload | false;
}
