import { Injectable } from '@nestjs/common';
import { OrganizationUserStatusMapperService } from '../../application/ports/organization-user-status-mapper.service';
import {
  ORGANIZATION_USER_ACTIVE,
  ORGANIZATION_USER_CREATED,
  ORGANIZATION_USER_INVITED,
  ORGANIZATION_USER_SUSPENDED,
} from '../../domain/constants';

const ORGANIZATION_USER_STATUS_MAP: Record<string, string> = {
  [ORGANIZATION_USER_CREATED]: 'Created',
  [ORGANIZATION_USER_INVITED]: 'Invited',
  [ORGANIZATION_USER_ACTIVE]: 'Active',
  [ORGANIZATION_USER_SUSPENDED]: 'Suspended',
};

@Injectable()
export class AppOrganizationUserStatusMapperService implements OrganizationUserStatusMapperService {
  toText(status: string): string {
    const statusText = Object.prototype.hasOwnProperty.call(
      ORGANIZATION_USER_STATUS_MAP,
      status,
    )
      ? ORGANIZATION_USER_STATUS_MAP[status]
      : undefined;

    if (typeof statusText !== 'string') {
      throw new Error(`Invalid organization user status: ${status}`);
    }
    return statusText;
  }
}
