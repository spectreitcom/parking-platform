import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { UserRefreshTokenDto } from '../dto/user-refresh-token.dto';

@Injectable()
export class RefreshTokenHandler implements IControllerHandler {
  constructor(private readonly userIamFacade: UserIamFacade) {}

  async handle(dto: UserRefreshTokenDto) {
    return await this.userIamFacade.refreshToken(dto.refreshToken);
  }
}
