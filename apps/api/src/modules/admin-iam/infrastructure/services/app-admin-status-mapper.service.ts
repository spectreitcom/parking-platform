import { Injectable } from '@nestjs/common';
import { AdminStatusMapperService } from '../../application/ports/admin-status-mapper.service';
import {
  ADMIN_ACTIVE,
  ADMIN_CREATED,
  ADMIN_INVITED,
  ADMIN_SUSPENDED,
} from '../../domain/constants';

const ADMIN_STATUS_MAP: Record<string, string> = {
  [ADMIN_CREATED]: 'Created',
  [ADMIN_INVITED]: 'Invited',
  [ADMIN_ACTIVE]: 'Active',
  [ADMIN_SUSPENDED]: 'Suspended',
};

@Injectable()
export class AppAdminStatusMapperService implements AdminStatusMapperService {
  toText(status: string): string {
    return ADMIN_STATUS_MAP[status];
  }
}
