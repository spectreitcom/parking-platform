import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/auth/sign-in' });
    }

    return { user: context.user };
  },
});

function ProtectedLayout() {
  return <Outlet />;
}
