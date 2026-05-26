import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { SuspendAdminUserDto } from '../dto/suspend-admin-user.dto';

@Injectable()
export class SuspendAdminUserHandler implements IControllerHandler {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

  async handle(adminUserId: string, dto: SuspendAdminUserDto) {
    await this.adminIamFacade.suspendAdminUser(adminUserId, dto.version);
    return { id: adminUserId };
  }
}
