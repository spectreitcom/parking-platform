'use client';

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useServerFn } from '@tanstack/react-start';
import { ParkingSquareIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '#/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog.tsx';
import { Field, FieldError, FieldLabel } from '#/components/ui/field.tsx';
import { Input } from '#/components/ui/input.tsx';
import { Spinner } from '#/components/ui/spinner.tsx';
import { ParkingFeatureSelect } from '#/features/parking-features/components/parking-feature-select.tsx';
import type { ParkingFeatureOption } from '#/features/parking-features/components/parking-feature-select.tsx';
import {
  addParkingSpot,
  updateParkingSpot,
} from '#/features/parking-spots/api';
import type { parkingSpotListItemSchema } from '#/features/parking-spots/schemas';

const parkingSpotFormSchema = z.object({
  price: z.coerce
    .number()
    .int('Price must be a whole number')
    .positive('Price must be greater than 0'),
  parkingFeatureIds: z.array(z.uuid()),
});

type ParkingSpotListItem = z.infer<typeof parkingSpotListItemSchema>;
type ParkingSpotFormValues = {
  price: string;
  parkingFeatureIds: Array<string>;
};

type AddParkingSpotModalProps = Readonly<{
  open: boolean;
  parkingId: string;
  onOpenChange: (open: boolean) => void;
  onParkingSpotAdded: () => Promise<void> | void;
}>;

type UpdateParkingSpotModalProps = Readonly<{
  open: boolean;
  parkingSpot: ParkingSpotListItem;
  onOpenChange: (open: boolean) => void;
  onParkingSpotUpdated: () => Promise<void> | void;
}>;

type ParkingSpotModalProps = Readonly<{
  open: boolean;
  title: string;
  submitLabel: string;
  featureSelectKey: string;
  initialValues: ParkingSpotFormValues;
  initialFeatures: ReadonlyArray<ParkingFeatureOption>;
  successMessage: string;
  errorMessage: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: ParkingSpotFormValues) => Promise<void>;
  onSubmitted: () => Promise<void> | void;
}>;

export function AddParkingSpotModal({
  open,
  parkingId,
  onOpenChange,
  onParkingSpotAdded,
}: AddParkingSpotModalProps) {
  const addParkingSpotFn = useServerFn(addParkingSpot);

  return (
    <ParkingSpotModal
      open={open}
      title="Add parking spot"
      submitLabel="Add spot"
      featureSelectKey={parkingId}
      initialValues={{
        price: '',
        parkingFeatureIds: [],
      }}
      initialFeatures={[]}
      successMessage="Parking spot added"
      errorMessage="Failed to add parking spot"
      onOpenChange={onOpenChange}
      onSubmit={async (value) => {
        await addParkingSpotFn({
          data: {
            parkingId,
            price: Number(value.price),
            parkingFeatureIds: value.parkingFeatureIds,
          },
        });
      }}
      onSubmitted={onParkingSpotAdded}
    />
  );
}

export function UpdateParkingSpotModal({
  open,
  parkingSpot,
  onOpenChange,
  onParkingSpotUpdated,
}: UpdateParkingSpotModalProps) {
  const updateParkingSpotFn = useServerFn(updateParkingSpot);
  return (
    <ParkingSpotModal
      open={open}
      title="Edit parking spot"
      submitLabel="Save changes"
      featureSelectKey={`${parkingSpot.id}-${parkingSpot.version}`}
      initialValues={{
        price: parkingSpot.price.toString(),
        parkingFeatureIds: parkingSpot.parkingSpotFeatures.map(
          (feature) => feature.id,
        ),
      }}
      initialFeatures={parkingSpot.parkingSpotFeatures}
      successMessage="Parking spot updated"
      errorMessage="Failed to update parking spot"
      onOpenChange={onOpenChange}
      onSubmit={async (value) => {
        await updateParkingSpotFn({
          data: {
            parkingSpotId: parkingSpot.id,
            version: parkingSpot.version,
            price: Number(value.price),
            parkingFeatureIds: value.parkingFeatureIds,
          },
        });
      }}
      onSubmitted={onParkingSpotUpdated}
    />
  );
}

function ParkingSpotModal({
  open,
  title,
  submitLabel,
  featureSelectKey,
  initialValues,
  initialFeatures,
  successMessage,
  errorMessage,
  onOpenChange,
  onSubmit,
  onSubmitted,
}: ParkingSpotModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: parkingSpotFormSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      try {
        await onSubmit(value);
        toast.success(successMessage);
        resetModalState();
        onOpenChange(false);
        await onSubmitted();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  function resetModalState() {
    form.reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          resetModalState();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
            <ParkingSquareIcon aria-hidden="true" className="size-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <form.Field
            name="price"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="parkingFeatureIds"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Parking features</FieldLabel>
                  <ParkingFeatureSelect
                    key={`${open ? 'open' : 'closed'}-${featureSelectKey}`}
                    active={open}
                    level="PARKING_SPOT"
                    value={field.state.value}
                    initialOptions={initialFeatures}
                    onChange={field.handleChange}
                  />

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetModalState();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
