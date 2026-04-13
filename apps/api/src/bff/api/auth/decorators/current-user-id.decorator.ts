import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../types';
import { Request } from 'express';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;

    return user.id;
  },
);
