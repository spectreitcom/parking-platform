import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { ActivateAdminUserDto } from '../dto/activate-admin-user.dto';

@Injectable()
export class ActivateAdminUserHandler implements IControllerHandler {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

  async handle(adminUserId: string, dto: ActivateAdminUserDto) {
    await this.adminIamFacade.activateAdminUser(adminUserId, dto.version);
    return { id: adminUserId };
  }
}
