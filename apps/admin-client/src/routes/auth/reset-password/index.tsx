import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { RequestResetPasswordForm } from '#/features/auth/components/request-reset-password-form.tsx';
import { ResetPasswordForm } from '#/features/auth/components/reset-password-form.tsx';
import { Button } from '#/components/ui/button';
import { ParkingCircle } from 'lucide-react';
import { z } from 'zod';

const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute('/auth/reset-password/')({
  validateSearch: resetPasswordSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useSearch();
  const isResetMode = Boolean(token);
  const isValidToken = token ? z.uuid().safeParse(token).success : false;

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-[460px]">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <ParkingCircle className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold">Parking Platform</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        </div>
        <Card className="shadow-[var(--elevated-shadow)]">
          <CardHeader>
            <CardTitle className="text-2xl">Reset hasła</CardTitle>
            <CardDescription>
              {isResetMode
                ? 'Wpisz nowe hasło dla swojego konta.'
                : 'Podaj adres email, a wyślemy link do zresetowania hasła.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isResetMode ? (
              isValidToken ? (
                <ResetPasswordForm token={token} />
              ) : (
                <div className="space-y-5">
                  <Alert variant="destructive">
                    <AlertTitle>Nieprawidłowy link resetujący</AlertTitle>
                    <AlertDescription>
                      Link do resetowania hasła jest niepoprawny. Poproś o nowy
                      link i spróbuj ponownie.
                    </AlertDescription>
                  </Alert>
                  <Button asChild className="h-11 w-full">
                    <Link to="/auth/reset-password">
                      Wyślij nowy link resetujący
                    </Link>
                  </Button>
                </div>
              )
            ) : (
              <RequestResetPasswordForm />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
