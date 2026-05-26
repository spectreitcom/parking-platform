import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { UserResetPasswordTokenDto } from '../dto/user-reset-password-token.dto';

@Injectable()
export class ResetPasswordHandler implements IControllerHandler {
  constructor(private readonly userIamFacade: UserIamFacade) {}

  async handle(dto: UserResetPasswordTokenDto) {
    await this.userIamFacade.resetPassword(dto.token, dto.password);
  }
}
