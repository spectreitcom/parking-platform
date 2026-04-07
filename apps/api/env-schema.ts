import Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').required(),
  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().trim().min(32).required(),
  SENTRY_DSN: Joi.string().uri().required(),
  MAILER_HOST: Joi.string().required(),
  MAILER_PORT: Joi.number().integer().positive().required(),
  TRACE_EXPORTER_URL: Joi.string().uri().required(),
  LOG_EXPORTER_URL: Joi.string().uri().required(),
  METRIC_EXPORTER_URL: Joi.string().uri().required(),
});
