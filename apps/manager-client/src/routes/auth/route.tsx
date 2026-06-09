import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/auth')({
  component: Layout,
});

function Layout() {
  return (
    <main className="min-h-screen">
      <Outlet />
    </main>
  );
}
