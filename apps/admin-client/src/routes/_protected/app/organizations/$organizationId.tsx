import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '#/components/confirm-dialog.tsx';
import { EmptyState, PageShell } from '#/components/page-shell';
import { Button } from '#/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import {
  getOrganization,
  removeMemberFromOrganization,
} from '#/features/organizations/api';
import { EditOrganizationModal } from '#/features/organizations/components/edit-organization-modal.tsx';
import type { OrganizationListItemSchema } from '#/features/organizations/schemas';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Hash,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AddMemberModal } from '#/features/organizations/components/add-member-modal.tsx';
import { MembersTable } from '#/features/organizations/components/members-table.tsx';

export const Route = createFileRoute(
  '/_protected/app/organizations/$organizationId',
)({
  component: RouteComponent,
  pendingComponent: () => (
    <div className={'flex h-full w-full items-center justify-center'}>
      <Spinner className={'size-8'} />
    </div>
  ),
  loader: async ({ params }) => {
    try {
      const organization = await getOrganization({
        data: {
          organizationId: params.organizationId,
        },
      });

      return {
        organization,
        error: null,
      };
    } catch (error) {
      return {
        organization: null,
        error: 'Failed to fetch organization details.',
      };
    }
  },
});

function RouteComponent() {
  const { organization, error } = Route.useLoaderData();
  const router = useRouter();
  const removeMemberFromOrganizationFn = useServerFn(
    removeMemberFromOrganization,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<
    OrganizationListItemSchema['members'][number] | null
  >(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  if (error || !organization) {
    return (
      <PageShell
        eyebrow="Organizations"
        title="Organization details"
        description="Review organization information and assigned members."
        action={<BackButton />}
      >
        <EmptyState
          icon={<AlertTriangle className="size-5" />}
          title="Could not load organization"
          description={error}
        />
      </PageShell>
    );
  }

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsRemovingMember(true);
    try {
      await removeMemberFromOrganizationFn({
        data: {
          organizationId: organization.id,
          memberId: memberToRemove.id,
          version: organization.version,
        },
      });
      toast.success('Member removed successfully');
      setMemberToRemove(null);
      await router.invalidate();
    } catch (removeMemberError) {
      if (removeMemberError instanceof Error) {
        toast.error(removeMemberError.message);
      } else {
        toast.error('Failed to remove member');
      }
    } finally {
      setIsRemovingMember(false);
    }
  };

  return (
    <PageShell
      eyebrow="Organizations"
      title={organization.name}
      description="Review organization profile data, ownership, and assigned organization members."
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <BackButton />
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Pencil className="size-4" />
            Edit Organization
          </Button>
          <Button onClick={() => setIsAddMemberModalOpen(true)}>
            <Plus className="size-4" />
            Add Member
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <OrganizationSummary organization={organization} />
        <OrganizationStats organization={organization} />
      </div>

      <MembersTable
        members={organization.members}
        onRemoveMember={setMemberToRemove}
      />

      <EditOrganizationModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        organizationId={organization.id}
      />

      <AddMemberModal
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
        organization={organization}
      />

      <ConfirmDialog
        open={memberToRemove !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMemberToRemove(null);
          }
        }}
        title="Remove Member"
        description={`Are you sure you want to remove "${memberToRemove?.displayName}" from this organization?`}
        onConfirm={handleConfirmRemoveMember}
        variant="destructive"
        isLoading={isRemovingMember}
        confirmText="Remove"
      />
    </PageShell>
  );
}

function BackButton() {
  return (
    <Button variant="outline" asChild>
      <Link to="/app/organizations">
        <ArrowLeft className="size-4" />
        Organizations
      </Link>
    </Button>
  );
}

function OrganizationSummary({
  organization,
}: Readonly<{
  organization: OrganizationListItemSchema;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Core legal and contact information for this organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailItem
            icon={<Building2 className="size-4" />}
            label="Name"
            value={organization.name}
          />
          <DetailItem
            icon={<Hash className="size-4" />}
            label="Tax ID"
            value={organization.taxId}
          />
          <DetailItem
            icon={<MapPin className="size-4" />}
            label="Address"
            value={organization.address}
            className="sm:col-span-2"
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function OrganizationStats({
  organization,
}: Readonly<{
  organization: OrganizationListItemSchema;
}>) {
  const rootMembersCount = organization.members.filter(
    (member) => member.isRoot,
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <MetricCard
        icon={<Users className="size-4" />}
        label="Members"
        value={organization.members.length.toString()}
      />
      <MetricCard
        icon={<ShieldCheck className="size-4" />}
        label="Root Members"
        value={rootMembersCount.toString()}
      />
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  className,
}: Readonly<{
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}>) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: Readonly<{
  icon: ReactNode;
  label: string;
  value: string;
}>) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold leading-none">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
