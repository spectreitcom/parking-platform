import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/app/')({
  beforeLoad: ({ context }) => {
    const organization = context.user.organizations.at(0);

    if (organization) {
      throw redirect({
        to: '/app/$organizationId',
        params: { organizationId: organization.id },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return null;
}
