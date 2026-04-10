import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from '../../application/ports/refresh-token.service';
import { RefreshTokenPayload } from '../../application/types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtRefreshTokenService implements RefreshTokenService {
  constructor(private readonly jwtService: JwtService) {}

  createToken(userId: string, refreshTokenId: string): string {
    return this.jwtService.sign(
      { sub: userId, refreshTokenId },
      {
        expiresIn: '7d',
      },
    );
  }

  verifyToken(token: string): RefreshTokenPayload | false {
    try {
      return this.jwtService.verify<RefreshTokenPayload>(token);
    } catch {
      return false;
    }
  }
}
