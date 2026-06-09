import { AuthPageShell } from '#/features/auth/components/auth-page-shell';
import { RequestResetPasswordForm } from '#/features/auth/components/request-reset-password-form';
import { ResetPasswordForm } from '#/features/auth/components/reset-password-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/reset-password/')({
  validateSearch: (search) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();

  if (token) {
    return (
      <AuthPageShell
        eyebrow="Reset hasła"
        title="Ustaw nowe hasło"
        description="Wprowadź nowe hasło dla konta powiązanego z linkiem resetującym."
        backToSignIn
      >
        <ResetPasswordForm token={token} />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      eyebrow="Odzyskiwanie dostępu"
      title="Wyślij link resetujący"
      description="Podaj adres email, a jeśli konto istnieje, wyślemy instrukcję ustawienia nowego hasła."
      backToSignIn
    >
      <RequestResetPasswordForm />
    </AuthPageShell>
  );
}
