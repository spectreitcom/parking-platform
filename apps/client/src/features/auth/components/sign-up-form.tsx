import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { Button } from '#/components/ui/button';
import { Field, FieldError, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { Spinner } from '#/components/ui/spinner';
import { signUp } from '#/features/auth/api';
import { signUpFormSchema } from '#/features/auth/schemas';
import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { LockKeyhole, Mail, User } from 'lucide-react';
import { useState } from 'react';

export function SignUpForm() {
  const [hasError, setHasError] = useState(false);
  const signUpFn = useServerFn(signUp);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: { onSubmit: signUpFormSchema },
    onSubmit: async ({ value }) => {
      setHasError(false);

      try {
        await signUpFn({
          data: {
            name: value.name,
            email: value.email,
            password: value.password,
          },
        });
        await router.navigate({ to: '/auth/sign-in' });
      } catch {
        setHasError(true);
      }
    },
  });

  const fields = [
    {
      name: 'name' as const,
      label: 'Imię',
      type: 'text',
      autoComplete: 'name',
      Icon: User,
    },
    {
      name: 'email' as const,
      label: 'Adres email',
      type: 'email',
      autoComplete: 'email',
      Icon: Mail,
    },
    {
      name: 'password' as const,
      label: 'Hasło',
      type: 'password',
      autoComplete: 'new-password',
      Icon: LockKeyhole,
    },
    {
      name: 'confirmPassword' as const,
      label: 'Powtórz hasło',
      type: 'password',
      autoComplete: 'new-password',
      Icon: LockKeyhole,
    },
  ];

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        await form.handleSubmit();
      }}
    >
      {hasError && (
        <Alert variant="destructive">
          <AlertTitle>Błąd podczas rejestracji</AlertTitle>
          <AlertDescription>
            Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie.
          </AlertDescription>
        </Alert>
      )}

      {fields.map(({ name, label, type, autoComplete, Icon }) => (
        <form.Field
          key={name}
          name={name}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <div className="relative">
                  <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type={type}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete={autoComplete}
                    aria-invalid={isInvalid}
                    className="pl-9"
                  />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      ))}

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting && <Spinner />}
        Zarejestruj się
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Masz już konto?{' '}
        <Button asChild type="button" variant="link" className="h-auto p-0">
          <Link to="/auth/sign-in">Zaloguj się</Link>
        </Button>
      </p>
    </form>
  );
}
