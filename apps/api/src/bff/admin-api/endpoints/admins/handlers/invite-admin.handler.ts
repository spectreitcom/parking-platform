import { Injectable } from '@nestjs/common';
import { IControllerHandler } from 'src/shared/controller-handler.interface';
import { AdminIamFacade } from 'src/modules/admin-iam/application/admin-iam.facade';
import { InviteAdminDto } from '../dto/invite-admin.dto';

@Injectable()
export class InviteAdminHandler implements IControllerHandler {
  constructor(private readonly adminIamFacade: AdminIamFacade) {}

  async handle(dto: InviteAdminDto) {
    const id = await this.adminIamFacade.inviteAdminUser(
      dto.email,
      dto.displayName,
    );
    return { id };
  }
}
