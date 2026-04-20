import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email({
    message: 'Niepoprawny adres email',
  }),
  password: z.string().min(1, { message: 'Hasło jest wymagane' }),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const signInResponseSchema = z.object({
  accessToken: z.jwt(),
  refreshToken: z.jwt(),
});

export const getMeResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  displayName: z.string(),
  isSuperAdmin: z.boolean(),
});
