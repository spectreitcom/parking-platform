import ThemeToggle from '#/components/ThemeToggle';
import { Card, CardContent } from '#/components/ui/card';
import type { ReactNode } from 'react';

type AuthPageShellProps = Readonly<{
  children: ReactNode;
}>;

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-md space-y-4">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <h1 className="text-center text-2xl font-bold text-[var(--sea-ink)]">
          Parking Platform Manger
        </h1>
        <Card className="rounded-md border-[var(--line)] bg-[var(--surface-strong)] shadow-sm">
          <CardContent className="px-6 py-6">{children}</CardContent>
        </Card>
      </section>
    </div>
  );
}
