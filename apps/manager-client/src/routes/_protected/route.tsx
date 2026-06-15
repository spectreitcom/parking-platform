import { Outlet, createFileRoute } from '@tanstack/react-router';
import { Building2Icon } from 'lucide-react';

import { AppSidebar } from '#/components/app-sidebar.tsx';
import ThemeToggle from '#/components/ThemeToggle';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert.tsx';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar.tsx';
import { getMe } from '#/features/auth/api';

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
  beforeLoad: async () => {
    const user = await getMe();
    return { user };
  },
});

function ProtectedLayout() {
  const { user } = Route.useRouteContext();
  const hasOrganizations = user.organizations.length > 0;

  return (
    <SidebarProvider>
      <AppSidebar organizations={user.organizations} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col p-4 md:p-6">
          {hasOrganizations ? <Outlet /> : <NoOrganizationsMessage />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function NoOrganizationsMessage() {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-7rem)] w-full max-w-2xl items-center">
      <Alert>
        <Building2Icon aria-hidden="true" />
        <AlertTitle>No organizations available</AlertTitle>
        <AlertDescription>
          Your account is active, but it is not assigned to any organization
          yet. Ask an administrator to add you to an organization before using
          the manager console.
        </AlertDescription>
      </Alert>
    </div>
  );
}
