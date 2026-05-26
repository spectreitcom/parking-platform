import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { UserIamFacade } from 'src/modules/user-iam/application/user-iam.facade';
import { RegisterUserDto } from '../dto/register-user.dto';

@Injectable()
export class RegisterUserHandler implements IControllerHandler {
  constructor(private readonly userIamFacade: UserIamFacade) {}

  async handle(dto: RegisterUserDto) {
    return await this.userIamFacade.registerUser(
      dto.email,
      dto.name,
      dto.password,
    );
  }
}
