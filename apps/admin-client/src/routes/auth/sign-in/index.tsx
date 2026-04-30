import { createFileRoute } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { SignInForm } from '#/features/auth/components/sign-in-form.tsx';
import { ParkingCircle } from 'lucide-react';

export const Route = createFileRoute('/auth/sign-in/')({
  component: RouteComponent,
});

function RouteComponent() {
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
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Use your administrator credentials to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
