import { Card, CardContent } from '#/components/ui/card';
import { CarFront } from 'lucide-react';
import type { ReactNode } from 'react';

type AuthPageShellProps = Readonly<{
  children: ReactNode;
}>;

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <section className="w-full max-w-md space-y-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <CarFront className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="page-eyebrow">Witaj w</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--sea-ink)]">
              Parking Platform
            </h1>
          </div>
        </div>
        <Card className="border-[var(--line)] bg-[var(--surface-strong)] shadow-lg">
          <CardContent className="px-6 py-6">{children}</CardContent>
        </Card>
      </section>
    </div>
  );
}
