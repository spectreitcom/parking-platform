import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '#/components/ui/card.tsx';
import { SignInForm } from '#/features/auth/components/sign-in-form.tsx';

export const Route = createFileRoute('/auth/sign-in/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={'flex justify-center items-center h-full'}>
      <div className={'min-w-[500px]'}>
        <Card>
          <CardContent>
            <h1 className={'text-2xl font-bold mb-4'}>
              Parking Platform Admin
            </h1>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
