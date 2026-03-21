import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
}
