import * as Sentry from '@sentry/nestjs';
import { config } from 'dotenv';

config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enableLogs: true,
});
