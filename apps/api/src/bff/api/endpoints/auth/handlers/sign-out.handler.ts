import { HttpStatus, Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';

@Injectable()
export class SignOutHandler implements IControllerHandler {
  constructor(private readonly userIamFacade: UserIamFacade) {}

  async handle(userId: string) {
    await this.userIamFacade.signOut(userId);
    return { status: HttpStatus.OK };
  }
}
