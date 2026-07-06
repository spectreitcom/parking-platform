import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { Button } from '#/components/ui/button';
import { Field, FieldError, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { Spinner } from '#/components/ui/spinner';
import { requestResetPassword } from '#/features/auth/api';
import { requestResetPasswordInputSchema } from '#/features/auth/schemas';
import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Mail } from 'lucide-react';
import { useState } from 'react';

export function RequestResetPasswordForm() {
  const [hasError, setHasError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const requestResetPasswordFn = useServerFn(requestResetPassword);

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: requestResetPasswordInputSchema,
    },
    onSubmit: async ({ value }) => {
      setHasError(false);
      setIsSubmitted(false);
      setIsFormSubmitting(true);

      try {
        await requestResetPasswordFn({
          data: value,
        });
        setIsSubmitted(true);
      } catch {
        setHasError(true);
      } finally {
        setIsFormSubmitting(false);
      }
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
    >
      {hasError && (
        <Alert variant="destructive">
          <AlertTitle>Błąd podczas resetowania hasła</AlertTitle>
          <AlertDescription>
            Nie udało się wysłać linku resetującego. Spróbuj ponownie.
          </AlertDescription>
        </Alert>
      )}

      {isSubmitted && (
        <Alert>
          <AlertTitle>Sprawdź skrzynkę email</AlertTitle>
          <AlertDescription>
            Jeśli konto istnieje, wyślemy link do zresetowania hasła.
          </AlertDescription>
        </Alert>
      )}

      <form.Field
        name="email"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Adres email</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="email"
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
        disabled={isFormSubmitting || form.state.isSubmitting}
      >
        {(isFormSubmitting || form.state.isSubmitting) && <Spinner />}
        Wyślij link resetujący
      </Button>

      <Button asChild type="button" variant="link" className="h-auto w-full">
        <Link to="/auth/sign-in">Wróć do logowania</Link>
      </Button>
    </form>
  );
}
