import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { AdminRefreshTokenDto } from '../dto/admin-refresh-token.dto';

@Injectable()
export class AdminRefreshTokenHandler implements IControllerHandler {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

  async handle(dto: AdminRefreshTokenDto) {
    return await this.adminIamFacade.refreshToken(dto.refreshToken);
  }
}
