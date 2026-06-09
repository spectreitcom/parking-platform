import { createFileRoute } from '@tanstack/react-router';
import { getMe } from '#/features/auth/api';

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
  beforeLoad: async () => {
    const user = await getMe();
    return { user };
  },
});

function ProtectedLayout() {
  // const { user } = Route.useRouteContext();

  return <div>Hello "/_protected"!</div>;
}
