import { createFileRoute, Outlet } from '@tanstack/react-router';
import { getMe } from '#/features/auth/api';
import { TooltipProvider } from '#/components/ui/tooltip.tsx';
import { SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar.tsx';
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
    <SidebarProvider>
      <TooltipProvider>
        <AppSidebar />
        <SidebarTrigger />
        <main className={'p-8 w-full'}>
          <Outlet />
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}
