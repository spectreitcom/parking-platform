import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';

@Injectable()
export class SignInHandler implements IControllerHandler {
  constructor(private readonly userIamFacade: UserIamFacade) {}

  async handle(userId: string) {
    return await this.userIamFacade.signIn(userId);
  }
}
