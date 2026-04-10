import { SetMetadata } from '@nestjs/common';

export const IS_API_PUBLIC = 'IS_API_PUBLIC';
export const PublicApi = () => SetMetadata(IS_API_PUBLIC, true);
