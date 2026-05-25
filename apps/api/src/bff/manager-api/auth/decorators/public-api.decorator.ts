import { SetMetadata } from '@nestjs/common';

export const IS_MANAGER_API_PUBLIC = 'IS_MANAGER_API_PUBLIC';

export const PublicApi = () => SetMetadata(IS_MANAGER_API_PUBLIC, true);
