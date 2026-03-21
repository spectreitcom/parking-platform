import { SetMetadata } from '@nestjs/common';

export const IS_ADMIN_API_PUBLIC = 'IS_ADMIN_API_PUBLIC';

export const PublicApi = () => SetMetadata(IS_ADMIN_API_PUBLIC, true);
