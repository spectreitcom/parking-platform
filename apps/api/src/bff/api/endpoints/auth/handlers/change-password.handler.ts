import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { UserChangePasswordDto } from '../dto/user-change-password.dto';

@Injectable()
export class ChangePasswordHandler implements IControllerHandler {
  constructor(private readonly userIamFacade: UserIamFacade) {}

  async handle(userId: string, dto: UserChangePasswordDto) {
    await this.userIamFacade.changePassword(
      userId,
      dto.existingPassword,
      dto.newPassword,
    );
  }
}
