'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog';
import type { PlaceTypesListItemSchema } from '#/features/parkings/schemas';
import { PlaceGenericForm } from '#/features/parkings/components/place-generic-form.tsx';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeTypes: Omit<PlaceTypesListItemSchema, 'version'>[];
}>;

export function CreatePlaceModal({ open, onOpenChange, placeTypes }: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Place</DialogTitle>
        </DialogHeader>

        <PlaceGenericForm placeTypes={placeTypes} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
