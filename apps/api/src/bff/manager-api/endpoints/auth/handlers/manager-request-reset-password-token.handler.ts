import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import { ManagerRequestResetPasswordTokenDto } from '../dto/manager-request-reset-password-token.dto';

@Injectable()
export class ManagerRequestResetPasswordTokenHandler implements IControllerHandler {
  constructor(
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
  ) {}

  async handle(dto: ManagerRequestResetPasswordTokenDto) {
    return await this.organizationUserIamFacade.requestResetPassword(dto.email);
  }
}
