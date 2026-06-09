import { Button } from '#/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card';
import { Separator } from '#/components/ui/separator';
import ThemeToggle from '#/components/ThemeToggle';
import { Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarClock,
  CarFront,
  ChartNoAxesCombined,
  CircleParking,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';

type AuthPageShellProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  backToSignIn?: boolean;
}>;

const highlights = [
  {
    icon: CalendarClock,
    label: 'Rezerwacje',
    value: '24/7',
  },
  {
    icon: ChartNoAxesCombined,
    label: 'Obłożenie',
    value: 'Live',
  },
  {
    icon: ShieldCheck,
    label: 'Dostęp',
    value: 'SSO ready',
  },
];

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  backToSignIn = false,
}: AuthPageShellProps) {
  return (
    <div className="min-h-screen overflow-hidden px-4 py-5 text-[var(--sea-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 py-2">
          <Link
            to="/auth/sign-in"
            className="group inline-flex items-center gap-3 text-sm font-semibold text-[var(--sea-ink)] no-underline"
            aria-label="Parking Platform Manager"
          >
            <span className="grid size-10 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] shadow-sm">
              <CircleParking className="size-5 text-[var(--lagoon-deep)]" />
            </span>
            <span className="hidden leading-tight sm:block">
              Parking Platform
              <span className="block text-xs font-medium text-[var(--sea-ink-soft)]">
                Manager
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {backToSignIn && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth/sign-in">
                  <ArrowLeft />
                  Logowanie
                </Link>
              </Button>
            )}
            <ThemeToggle />
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-10">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-2 text-sm font-semibold text-[var(--kicker)] shadow-sm">
                <Sparkles className="size-4" />
                Panel operacyjny parkingów
              </div>
              <h1 className="display-title text-5xl leading-[1.02] tracking-normal text-[var(--sea-ink)] xl:text-6xl">
                Spokojne zarządzanie parkingiem zaczyna się od dobrego wejścia.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-[var(--sea-ink-soft)]">
                Logowanie dla zespołów, które kontrolują dostęp, miejsca,
                rezerwacje i operacje wielu lokalizacji w jednym, lekkim panelu.
              </p>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 shadow-sm backdrop-blur"
                  >
                    <item.icon className="mb-3 size-5 text-[var(--lagoon-deep)]" />
                    <div className="text-lg font-bold text-[var(--sea-ink)]">
                      {item.value}
                    </div>
                    <div className="mt-1 text-xs font-medium text-[var(--sea-ink-soft)]">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 max-w-lg rounded-md border border-[var(--line)] bg-[var(--surface-strong)] p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--sand)] text-[var(--palm)]">
                    <BadgeCheck className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--sea-ink)]">
                      Bezpieczna sesja operatorska
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--sea-ink-soft)]">
                      Dane logowania trafiają bezpośrednio do warstwy auth, a
                      panel po wejściu odświeża kontekst aktualnego użytkownika.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <Card className="island-shell overflow-hidden rounded-md border-[var(--line)] py-0 shadow-[0_30px_90px_rgba(23,58,64,0.18)]">
              <CardHeader className="px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="grid size-12 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-sm">
                    <CarFront className="size-6 text-[var(--lagoon-deep)]" />
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-md border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-xs font-bold uppercase text-[var(--kicker)]">
                    <Building2 className="size-3.5" />
                    Manager
                  </div>
                </div>
                <CardDescription className="font-semibold text-[var(--kicker)]">
                  {eyebrow}
                </CardDescription>
                <CardTitle className="display-title text-3xl leading-tight text-[var(--sea-ink)]">
                  {title}
                </CardTitle>
                <p className="pt-2 text-sm leading-6 text-[var(--sea-ink-soft)]">
                  {description}
                </p>
              </CardHeader>
              <Separator className="bg-[var(--line)]" />
              <CardContent className="px-6 py-6 sm:px-8 sm:py-8">
                {children}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
