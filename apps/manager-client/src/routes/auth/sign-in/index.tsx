import { AuthPageShell } from '#/features/auth/components/auth-page-shell';
import { SignInForm } from '#/features/auth/components/sign-in-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/sign-in/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthPageShell
      eyebrow="Witaj ponownie"
      title="Zaloguj się do panelu"
      description="Wejdź do przestrzeni zarządzania parkingami, użytkownikami i rezerwacjami."
    >
      <SignInForm />
    </AuthPageShell>
  );
}
