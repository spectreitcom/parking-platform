import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import {
  CalendarCheckIcon,
  CarFrontIcon,
  ChevronDownIcon,
  KeyRoundIcon,
  LaptopIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '#/components/ui/avatar.tsx';
import { Button } from '#/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import ThemeToggle from '#/components/ThemeToggle';
import { signOut } from '#/features/auth/api';
import { ChangePasswordModal } from '#/features/auth/components/change-password-modal.tsx';
import { useTheme } from '#/hooks/use-theme';

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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const signOutFn = useServerFn(signOut);
  const { mode, toggleThemeMode } = useTheme();

  const ThemeIcon =
    mode === 'auto' ? LaptopIcon : mode === 'dark' ? MoonIcon : SunIcon;
  const themeLabel =
    mode === 'auto' ? 'Automatyczny' : mode === 'dark' ? 'Ciemny' : 'Jasny';

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutFn();
    } catch (error) {
      setIsSigningOut(false);
      toast.error(
        error instanceof Error ? error.message : 'Nie udało się wylogować',
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[var(--sea-ink)] no-underline"
          aria-label="Parking Platform — strona główna"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CarFrontIcon className="size-5" aria-hidden="true" />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:block">
            Parking Platform
          </span>
        </Link>

        {user ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 min-w-0 gap-2 rounded-xl px-1.5 sm:gap-3 sm:px-2"
                  aria-label={`Otwórz menu użytkownika ${user.name}`}
                >
                  <Avatar className="size-9 ring-1 ring-[var(--chip-line)]">
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {getInitials(user.name) || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden min-w-0 text-left leading-tight sm:block">
                    <span className="block max-w-40 truncate text-sm font-semibold text-[var(--sea-ink)]">
                      {user.name}
                    </span>
                    <span className="block max-w-40 truncate text-xs font-normal text-[var(--sea-ink-soft)]">
                      Moje konto
                    </span>
                  </span>
                  <ChevronDownIcon
                    className="hidden size-4 text-[var(--sea-ink-soft)] sm:block"
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-[min(18rem,calc(100vw-2rem))] rounded-xl p-1.5 shadow-xl"
              >
                <DropdownMenuLabel className="flex items-center gap-3 px-2.5 py-2.5 font-normal">
                  <Avatar className="size-10 ring-1 ring-[var(--chip-line)]">
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {getInitials(user.name) || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate font-semibold text-foreground">
                      {user.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="py-2.5">
                    <Link
                      to="/reservations"
                      className="text-popover-foreground! no-underline hover:text-accent-foreground! focus:text-accent-foreground!"
                    >
                      <CalendarCheckIcon aria-hidden="true" />
                      Moje rezerwacje
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="py-2.5"
                    onSelect={() => setIsChangePasswordOpen(true)}
                  >
                    <KeyRoundIcon aria-hidden="true" />
                    Zmień hasło
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="py-2.5"
                    onSelect={toggleThemeMode}
                  >
                    <ThemeIcon aria-hidden="true" />
                    Motyw
                    <span className="ml-auto text-xs text-muted-foreground">
                      {themeLabel}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="py-2.5"
                  disabled={isSigningOut}
                  onSelect={() => void handleSignOut()}
                >
                  {isSigningOut ? (
                    <Spinner aria-hidden="true" />
                  ) : (
                    <LogOutIcon aria-hidden="true" />
                  )}
                  {isSigningOut ? 'Wylogowywanie…' : 'Wyloguj się'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ChangePasswordModal
              open={isChangePasswordOpen}
              onOpenChange={setIsChangePasswordOpen}
            />
          </>
        ) : (
          <nav
            className="flex items-center gap-2"
            aria-label="Konto użytkownika"
          >
            <ThemeToggle compact />
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth/sign-in">Zaloguj się</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth/sign-up">Załóż konto</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
