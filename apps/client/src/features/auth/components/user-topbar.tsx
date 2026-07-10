import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { CalendarCheckIcon, CarFrontIcon, LogOutIcon } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '#/components/ui/avatar.tsx';
import { Button } from '#/components/ui/button.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { signOut } from '#/features/auth/api';

type UserTopbarProps = {
  user: {
    name: string;
    email: string;
  } | null;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function UserTopbar({ user }: UserTopbarProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const signOutFn = useServerFn(signOut);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOutFn();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[var(--sea-ink)] no-underline"
          aria-label="Parking Platform home"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CarFrontIcon className="size-5" aria-hidden="true" />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:block">
            Parking Platform
          </span>
        </Link>

        {user ? (
          <div className="flex min-w-0 items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/reservations" aria-label="Rezerwacje">
                <CalendarCheckIcon aria-hidden="true" />
                <span className="hidden sm:inline">Rezerwacje</span>
              </Link>
            </Button>
            <div className="min-w-0 text-right leading-tight">
              <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                {user.name}
              </p>
              <p className="truncate text-xs text-[var(--sea-ink-soft)]">
                {user.email}
              </p>
            </div>
            <Avatar className="size-9 ring-1 ring-[var(--chip-line)]">
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                {getInitials(user.name) || user.email.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-label="Sign out"
            >
              {isSigningOut ? (
                <Spinner aria-hidden="true" />
              ) : (
                <LogOutIcon aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        ) : (
          <nav className="flex items-center gap-2" aria-label="Authentication">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth/sign-up">Sign up</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
