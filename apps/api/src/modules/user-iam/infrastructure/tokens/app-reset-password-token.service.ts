import { Injectable } from '@nestjs/common';
import { ResetPasswordTokenService } from '../../application/ports/reset-password-token.service';
import { createHash } from 'node:crypto';

@Injectable()
export class AppResetPasswordTokenService implements ResetPasswordTokenService {
  createHash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
