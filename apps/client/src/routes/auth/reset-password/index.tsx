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
      <AuthPageShell>
        <ResetPasswordForm token={token} />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <RequestResetPasswordForm />
    </AuthPageShell>
  );
}
