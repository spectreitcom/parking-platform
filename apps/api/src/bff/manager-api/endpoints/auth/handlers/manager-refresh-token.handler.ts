import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { OrganizationUserIamFacade } from 'src/modules/organization-user-iam/application/organization-user-iam.facade';
import { ManagerRefreshTokenDto } from '../dto/manager-refresh-token.dto';

@Injectable()
export class ManagerRefreshTokenHandler implements IControllerHandler {
  constructor(
    private readonly organizationUserIamFacade: OrganizationUserIamFacade,
  ) {}

  async handle(dto: ManagerRefreshTokenDto) {
    return await this.organizationUserIamFacade.refreshToken(dto.refreshToken);
  }
}
