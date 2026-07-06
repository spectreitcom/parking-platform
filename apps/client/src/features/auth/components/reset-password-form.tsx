import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { Button } from '#/components/ui/button';
import { Field, FieldError, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { Spinner } from '#/components/ui/spinner';
import { resetPassword } from '#/features/auth/api';
import { resetPasswordFormSchema } from '#/features/auth/schemas';
import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { CheckCircle2, LockKeyhole } from 'lucide-react';
import { useState } from 'react';

type ResetPasswordFormProps = Readonly<{
  token: string;
}>;

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetPasswordFn = useServerFn(resetPassword);

  const form = useForm({
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: resetPasswordFormSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      setIsSubmitted(false);

      try {
        await resetPasswordFn({
          data: {
            token: value.token,
            password: value.password,
          },
        });
        form.reset();
        setIsSubmitted(true);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Nie udało się ustawić nowego hasła.');
        }
      }
    },
  });

  if (isSubmitted) {
    return (
      <div className="space-y-5">
        <Alert>
          <CheckCircle2 className="size-4" />
          <AlertTitle>Hasło zostało zmienione</AlertTitle>
          <AlertDescription>
            Możesz teraz zalogować się używając nowego hasła.
          </AlertDescription>
        </Alert>
        <Button asChild className="h-11 w-full">
          <Link to="/auth/sign-in">Przejdź do logowania</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
    >
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Błąd podczas zmiany hasła</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form.Field
        name="password"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Nowe hasło</FieldLabel>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={isInvalid}
                  className="pl-9"
                />
              </div>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      <form.Field
        name="confirmPassword"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Powtórz nowe hasło</FieldLabel>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="new-password"
                  aria-invalid={isInvalid}
                  className="pl-9"
                />
              </div>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting && <Spinner />}
        Ustaw nowe hasło
      </Button>

      <Button asChild type="button" variant="link" className="h-auto w-full">
        <Link to="/auth/sign-in">Wróć do logowania</Link>
      </Button>
    </form>
  );
}
