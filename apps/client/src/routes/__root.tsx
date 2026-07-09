import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';

import appCss from '../styles.css?url';

import type { QueryClient } from '@tanstack/react-query';
import { Toaster } from '#/components/ui/sonner.tsx';
import type { ReactNode } from 'react';
import { getMe, isAuthenticated } from '#/features/auth/api';
import { UserTopbar } from '#/features/auth/components/user-topbar.tsx';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const authenticated = await isAuthenticated();
    const user = authenticated ? await getMe() : null;

    return { user };
  },
  component: RootLayout,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Parking Platform',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootLayout() {
  const { user } = Route.useRouteContext();

  return (
    <div className="min-h-screen">
      <UserTopbar user={user} />
      <Outlet />
    </div>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
