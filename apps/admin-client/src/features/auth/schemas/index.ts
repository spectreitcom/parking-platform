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

export type GetMeResponseSchema = z.infer<typeof getMeResponseSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.jwt().optional(),
});

export const changePasswordInputSchema = z.object({
  existingPassword: z
    .string()
    .min(1, { message: 'Current password is required' }),
  newPassword: z
    .string()
    .min(8, { message: 'New password must be at least 8 characters' }),
});

export const changePasswordFormSchema = changePasswordInputSchema
  .extend({
    confirmNewPassword: z
      .string()
      .min(1, { message: 'Please confirm the new password' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const requestResetPasswordInputSchema = z.object({ email: z.email() });

export const resetPasswordInputSchema = z.object({
  token: z.uuid(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export const resetPasswordFormSchema = resetPasswordInputSchema
  .extend({
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm the new password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
