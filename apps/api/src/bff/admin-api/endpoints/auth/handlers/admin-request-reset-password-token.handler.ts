import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { AdminRequestResetPasswordTokenDto } from '../dto/admin-request-reset-password-token.dto';

@Injectable()
export class AdminRequestResetPasswordTokenHandler implements IControllerHandler {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

  async handle(dto: AdminRequestResetPasswordTokenDto) {
    await this.adminIamFacade.requestResetPassword(dto.email);
  }
}
