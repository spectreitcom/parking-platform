import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';

@Injectable()
export class ManagerSignInHandler implements IControllerHandler {
  constructor(
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
  ) {}

  async handle(managerUserId: string) {
    return await this.organizationUserIamFacade.signIn(managerUserId);
  }
}
