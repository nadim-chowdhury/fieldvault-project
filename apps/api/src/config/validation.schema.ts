import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // ─── Server ─────────────────────────────────────────
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  APP_URL: Joi.string().uri().default('http://localhost:3001'),

  // ─── Database ───────────────────────────────────────
  DATABASE_URL: Joi.string().required(),

  // ─── Redis ──────────────────────────────────────────
  REDIS_URL: Joi.string().required(),

  // ─── JWT ────────────────────────────────────────────
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // ─── CORS ───────────────────────────────────────────
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),

  // ─── Cloudinary (optional in dev) ───────────────────
  CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
  CLOUDINARY_API_KEY: Joi.string().optional(),
  CLOUDINARY_API_SECRET: Joi.string().optional(),

  // ─── SendGrid (optional in dev) ─────────────────────
  SENDGRID_API_KEY: Joi.string().optional(),
  EMAIL_FROM: Joi.string().email().optional(),
});
