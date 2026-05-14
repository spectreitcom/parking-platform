import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog.tsx';
import { OrganizationGenericForm } from '#/features/organizations/components/organization-generic-form.tsx';
import { useServerFn } from '@tanstack/react-start';
import { getOrganization } from '#/features/organizations/api';
import { useEffect, useState } from 'react';
import type { OrganizationListItemSchema } from '#/features/organizations/schemas';
import { toast } from 'sonner';
import { Spinner } from '#/components/ui/spinner.tsx';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
}>;

export function EditOrganizationModal({
  open,
  onOpenChange,
  organizationId,
}: Props) {
  const getOrganizationFn = useServerFn(getOrganization);
  const [isFetching, setIsFetching] = useState(true);
  const [organization, setOrganization] =
    useState<OrganizationListItemSchema | null>(null);

  useEffect(() => {
    if (organizationId) {
      getOrganizationFn({ data: { organizationId } })
        .then((organizationDetails) => setOrganization(organizationDetails))
        .catch((error) => {
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error('Failed to fetch organization details');
          }
        })
        .finally(() => setIsFetching(false));
    }
  }, [organizationId, getOrganizationFn]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Organization Details</DialogTitle>
        </DialogHeader>

        {isFetching ? <Spinner /> : null}

        <OrganizationGenericForm
          organization={organization ?? undefined}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
