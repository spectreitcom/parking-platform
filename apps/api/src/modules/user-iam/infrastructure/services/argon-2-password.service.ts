import { PasswordService } from '../../application/ports/password.service';
import * as argon2 from 'argon2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Argon2PasswordService implements PasswordService {
  async create(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  async compare(hash: string, password: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }
}
