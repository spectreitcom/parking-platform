import { createParamDecorator, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RequestUser } from '../types';

export const CurrentManagerUser = createParamDecorator<void, RequestUser>(
  (_, executionContext) => {
    const request: Request = executionContext.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  },
);
