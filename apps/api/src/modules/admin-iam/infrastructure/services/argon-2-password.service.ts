import { Injectable } from '@nestjs/common';
import { PasswordService } from '../../application/ports/password.service';
import * as argon2 from 'argon2';

@Injectable()
export class Argon2PasswordService implements PasswordService {
  async create(plainPassword: string): Promise<string> {
    return await argon2.hash(plainPassword);
  }

  async compare(passwordHash: string, plainPassword: string): Promise<boolean> {
    return await argon2.verify(passwordHash, plainPassword);
  }
}
