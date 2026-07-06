import { AuthPageShell } from '#/features/auth/components/auth-page-shell';
import { SignUpForm } from '#/features/auth/components/sign-up-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/sign-up/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthPageShell>
      <SignUpForm />
    </AuthPageShell>
  );
}
