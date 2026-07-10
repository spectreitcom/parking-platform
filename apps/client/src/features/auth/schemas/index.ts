import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email({
    message: 'Niepoprawny adres e-mail',
  }),
  password: z.string().min(1, { message: 'Hasło jest wymagane' }),
});

export const signInResponseSchema = z.object({
  accessToken: z.jwt(),
  refreshToken: z.jwt(),
});

export const getMeResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.jwt().optional(),
});

export const changePasswordInputSchema = z.object({
  existingPassword: z
    .string()
    .min(1, { message: 'Obecne hasło jest wymagane' }),
  newPassword: z
    .string()
    .min(8, { message: 'Nowe hasło musi mieć co najmniej 8 znaków' }),
});

export const changePasswordFormSchema = changePasswordInputSchema
  .extend({
    confirmNewPassword: z.string().min(1, { message: 'Powtórz nowe hasło' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Hasła nie są takie same',
    path: ['confirmNewPassword'],
  });

export const requestResetPasswordInputSchema = z.object({
  email: z.email({ message: 'Niepoprawny adres e-mail' }),
});

export const resetPasswordInputSchema = z.object({
  token: z.uuid(),
  password: z
    .string()
    .min(8, { message: 'Hasło musi mieć co najmniej 8 znaków' }),
});

export const resetPasswordFormSchema = resetPasswordInputSchema
  .extend({
    confirmPassword: z.string().min(1, { message: 'Powtórz nowe hasło' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są takie same',
    path: ['confirmPassword'],
  });

export const signUpInputSchema = z.object({
  email: z.email({ message: 'Niepoprawny adres e-mail' }),
  password: z
    .string()
    .min(8, { message: 'Hasło musi mieć co najmniej 8 znaków' }),
  name: z.string().min(1, { message: 'Imię jest wymagane' }),
});

export const signUpFormSchema = signUpInputSchema
  .extend({
    confirmPassword: z
      .string()
      .min(1, { message: 'Potwierdzenie hasła jest wymagane' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są takie same',
    path: ['confirmPassword'],
  });
