import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { AdminResetPasswordTokenDto } from '../dto/admin-reset-password-token.dto';

@Injectable()
export class AdminResetPasswordHandler implements IControllerHandler {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

  async handle(dto: AdminResetPasswordTokenDto) {
    await this.adminIamFacade.resetPassword(dto.token, dto.password);
  }
}
