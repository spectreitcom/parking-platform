'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog';
import { OrganizationGenericForm } from '#/features/organizations/components/organization-generic-form.tsx';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

export function CreateOrganizationModal({ open, onOpenChange }: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>

        <OrganizationGenericForm onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
