import { Injectable } from '@nestjs/common';
import { AccessTokenService } from '../../application/ports/access-token.service';
import { JwtPayload } from '../../application/types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAccessTokenService implements AccessTokenService {
  constructor(private readonly jwtService: JwtService) {}

  createToken(userId: string): string {
    return this.jwtService.sign({
      sub: userId,
    });
  }

  verifyToken(token: string): JwtPayload | false {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return false;
    }
  }
}
