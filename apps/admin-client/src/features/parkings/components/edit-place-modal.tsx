import type {
  GetPlaceForEditingResponseSchema,
  PlaceTypesListItemSchema,
} from '#/features/parkings/schemas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog.tsx';
import { useServerFn } from '@tanstack/react-start';
import { getPlaceForEditing } from '#/features/parkings/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Spinner } from '#/components/ui/spinner.tsx';
import { PlaceGenericForm } from '#/features/parkings/components/place-generic-form.tsx';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeTypes: Omit<PlaceTypesListItemSchema, 'version'>[];
  placeId: string;
}>;

export function EditPlaceModal({
  open,
  onOpenChange,
  placeTypes,
  placeId,
}: Props) {
  const getPlaceForEditingFn = useServerFn(getPlaceForEditing);
  const [place, setPlace] = useState<GetPlaceForEditingResponseSchema | null>(
    null,
  );
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (placeId) {
      setPlace(null);
      setIsFetching(true);
      getPlaceForEditingFn({ data: { placeId } })
        .then((placeForEditing) => {
          setPlace(placeForEditing);
        })
        .catch((error) => {
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error('Failed to fetch place details');
          }
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [getPlaceForEditingFn, placeId]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Place Details</DialogTitle>
        </DialogHeader>

        {isFetching ? <Spinner /> : null}

        <PlaceGenericForm
          placeTypes={placeTypes}
          onOpenChange={onOpenChange}
          place={place ?? undefined}
        />
      </DialogContent>
    </Dialog>
  );
}
