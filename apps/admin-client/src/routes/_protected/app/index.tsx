import { createFileRoute } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Building2, CarFront, Map, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card';
import { PageShell } from '#/components/page-shell';

export const Route = createFileRoute('/_protected/app/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageShell
      eyebrow="Operations"
      title="Dashboard"
      description="A focused overview for managing parking locations, organizations, users, and operational configuration."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<CarFront className="size-5" />}
          label="Parking inventory"
          value="Parkings"
          description="Browse configured parking locations and availability status."
        />
        <SummaryCard
          icon={<Map className="size-5" />}
          label="Configuration"
          value="Place Types"
          description="Manage place type names used by parking layouts."
        />
        <SummaryCard
          icon={<ShieldCheck className="size-5" />}
          label="Access"
          value="Admin Users"
          description="Review administrator accounts and account status."
        />
        <SummaryCard
          icon={<Building2 className="size-5" />}
          label="Organizations"
          value="Coming soon"
          description="Organization management is prepared in the navigation."
        />
      </div>
    </PageShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
}: Readonly<{
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}>) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex size-10 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
          {icon}
        </div>
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-2 text-xl">{value}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
