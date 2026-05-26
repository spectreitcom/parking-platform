import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { AdminChangePasswordDto } from '../dto/admin-change-password.dto';

@Injectable()
export class AdminChangePasswordHandler implements IControllerHandler {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

  async handle(adminUserId: string, dto: AdminChangePasswordDto) {
    await this.adminIamFacade.changePassword(
      adminUserId,
      dto.existingPassword,
      dto.newPassword,
    );
  }
}
