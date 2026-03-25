import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestUser } from '../types';
import { Request } from 'express';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;
    if (!user) return false;
    return user.isSuperAdmin;
  }
}
