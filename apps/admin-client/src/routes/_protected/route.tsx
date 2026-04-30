import { createFileRoute, Outlet } from '@tanstack/react-router';
import { getMe } from '#/features/auth/api';
import { TooltipProvider } from '#/components/ui/tooltip.tsx';
import { SidebarProvider } from '#/components/ui/sidebar.tsx';
import { AppSidebar } from '#/components/app-sidebar.tsx';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const user = await getMe();
    return { user };
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return (
    <SidebarProvider className="min-h-svh">
      <TooltipProvider>
        <AppSidebar />
        <main className="min-w-0 flex-1 px-4 py-4 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}
