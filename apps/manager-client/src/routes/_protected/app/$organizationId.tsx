import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/app/$organizationId')({
  beforeLoad: ({ context, params }) => {
    const organization = context.user.organizations.find(
      (item) => item.id === params.organizationId,
    );

    if (!organization) {
      const fallbackOrganization = context.user.organizations.at(0);

      if (fallbackOrganization) {
        throw redirect({
          to: '/app/$organizationId',
          params: { organizationId: fallbackOrganization.id },
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { organizationId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const organization = user.organizations.find(
    (item) => item.id === organizationId,
  );

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">
        {organization?.name}
      </h1>
      <p className="text-sm text-muted-foreground">
        Manage parking operations for this organization.
      </p>
    </div>
  );
}
