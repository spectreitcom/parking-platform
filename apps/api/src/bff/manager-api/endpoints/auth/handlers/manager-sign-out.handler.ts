import { HttpStatus, Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';

@Injectable()
export class ManagerSignOutHandler implements IControllerHandler {
  constructor(
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
  ) {}

  async handle(managerUserId: string) {
    await this.organizationUserIamFacade.signOut(managerUserId);
    return {
      status: HttpStatus.OK,
    };
  }
}
