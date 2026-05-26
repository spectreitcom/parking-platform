import { HttpStatus, Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import { ManagerChangePasswordDto } from '../dto/manager-change-password.dto';

@Injectable()
export class ManagerChangePasswordHandler implements IControllerHandler {
  constructor(
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
  ) {}

  async handle(managerUserId: string, dto: ManagerChangePasswordDto) {
    await this.organizationUserIamFacade.changePassword(
      managerUserId,
      dto.existingPassword,
      dto.newPassword,
    );
    return { status: HttpStatus.OK };
  }
}
