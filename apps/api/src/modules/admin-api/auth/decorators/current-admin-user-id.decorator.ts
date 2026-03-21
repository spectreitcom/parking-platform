import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const CurrentAdminUserId = createParamDecorator<void, string>(
  (_, executionContext) => {
    const request: Request = executionContext.switchToHttp().getRequest();
    return request.user as string;
  },
);
