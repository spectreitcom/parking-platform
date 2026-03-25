import { createParamDecorator, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RequestUser } from 'src/modules/admin-api/auth/types';

export const CurrentAdminUserId = createParamDecorator<void, string>(
  (_, executionContext) => {
    const request: Request = executionContext.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user.id;
  },
);
