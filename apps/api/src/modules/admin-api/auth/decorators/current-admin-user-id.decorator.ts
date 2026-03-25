import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { RequestUser } from 'src/modules/admin-api/auth/types';

export const CurrentAdminUserId = createParamDecorator<void, string>(
  (_, executionContext) => {
    const request: Request = executionContext.switchToHttp().getRequest();
    return (request.user as RequestUser).id;
  },
);
