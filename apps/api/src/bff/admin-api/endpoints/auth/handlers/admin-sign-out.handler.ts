import { HttpStatus, Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';

@Injectable()
export class AdminSignOutHandler implements IControllerHandler {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

  async handle(adminUserId: string) {
    await this.adminIamFacade.signOut(adminUserId);
    return { status: HttpStatus.OK };
  }
}
