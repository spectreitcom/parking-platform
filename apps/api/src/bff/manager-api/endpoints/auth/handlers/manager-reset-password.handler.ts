import { HttpStatus, Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import { ManagerResetPasswordTokenDto } from '../dto/manager-reset-password-token.dto';

@Injectable()
export class ManagerResetPasswordHandler implements IControllerHandler {
  constructor(
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
  ) {}

  async handle(dto: ManagerResetPasswordTokenDto) {
    await this.organizationUserIamFacade.resetPassword(dto.token, dto.password);
    return { status: HttpStatus.OK };
  }
}
