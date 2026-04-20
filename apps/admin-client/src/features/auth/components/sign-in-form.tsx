import { Field, FieldError, FieldLabel } from '#/components/ui/field.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import { useServerFn } from '@tanstack/react-start';
import { signIn } from '#/features/auth/api';
import { useForm } from '@tanstack/react-form';
import { signInSchema } from '#/features/auth/schemas';
import { isRedirect } from '@tanstack/react-router';

export function SignInForm() {
  const [hasError, setHasError] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const signInFn = useServerFn(signIn);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setIsFormSubmitting(true);

      try {
        await signInFn({
          data: { ...value },
        });
      } catch (err) {
        if (!isRedirect(err)) {
          setHasError(true);
        }
      } finally {
        setIsFormSubmitting(false);
      }
    },
  });

  return (
    <form
      className={'space-y-8'}
      onSubmit={async (e) => {
        e.preventDefault();
        await form.handleSubmit();
      }}
    >
      {hasError && (
        <Alert variant={'destructive'}>
          <AlertTitle>Błąd podczas logowania</AlertTitle>
          <AlertDescription>
            Sprawdź poprawność wprowadzonych danych.
          </AlertDescription>
        </Alert>
      )}

      <form.Field
        name={'email'}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Adres email</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete={'off'}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      <form.Field
        name={'password'}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Hasło</FieldLabel>
              <Input
                id={field.name}
                type={'password'}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete={'off'}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      <Button
        type={'submit'}
        className={'w-full'}
        disabled={isFormSubmitting || form.state.isSubmitting}
      >
        {(isFormSubmitting || form.state.isSubmitting) && <Spinner />}
        Zaloguj
      </Button>
    </form>
  );
}
