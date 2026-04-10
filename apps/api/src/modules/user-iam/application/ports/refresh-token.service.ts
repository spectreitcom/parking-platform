import { RefreshTokenPayload } from '../types';

export abstract class RefreshTokenService {
  abstract createToken(userId: string, refreshTokenId: string): string;
  abstract verifyToken(token: string): RefreshTokenPayload | false;
}
