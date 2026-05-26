import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { UserRequestResetPasswordTokenDto } from '../dto/user-request-reset-password-token.dto';

@Injectable()
export class RequestResetPasswordTokenHandler implements IControllerHandler {
  constructor(private readonly userIamFacade: UserIamFacade) {}

  async handle(dto: UserRequestResetPasswordTokenDto) {
    await this.userIamFacade.requestResetPassword(dto.email);
  }
}
