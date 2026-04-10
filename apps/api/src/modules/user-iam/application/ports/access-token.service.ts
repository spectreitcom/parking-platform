import { JwtPayload } from '../types';

export abstract class AccessTokenService {
  abstract createToken(userId: string): string;
  abstract verifyToken(token: string): JwtPayload | false;
}
