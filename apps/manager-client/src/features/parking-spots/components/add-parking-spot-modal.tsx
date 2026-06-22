'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useServerFn } from '@tanstack/react-start';
import {
  CheckIcon,
  ChevronsUpDownIcon,
  ParkingSquareIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
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
import {
  addParkingSpot,
  updateParkingSpot,
} from '#/features/parking-spots/api';
import type { parkingSpotListItemSchema } from '#/features/parking-spots/schemas';
import { getParkingFeatures } from '#/features/parking-features/api';
import type { parkingFeatureListItemSchema } from '#/features/parking-features/schemas';
import { cn } from '#/lib/utils.ts';

const PARKING_FEATURES_LIMIT = 20;

const parkingSpotFormSchema = z.object({
  price: z.coerce
    .number()
    .int('Price must be a whole number')
    .positive('Price must be greater than 0'),
  parkingFeatureIds: z.array(z.uuid()),
});

type ParkingFeatureOption = Pick<
  z.infer<typeof parkingFeatureListItemSchema>,
  'id' | 'name'
>;
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
  initialValues: ParkingSpotFormValues;
  initialSelectedFeatures: Record<string, ParkingFeatureOption>;
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
      initialValues={{
        price: '',
        parkingFeatureIds: [],
      }}
      initialSelectedFeatures={{}}
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
  const initialSelectedFeatures = useMemo(
    () =>
      Object.fromEntries(
        parkingSpot.parkingSpotFeatures.map((feature) => [
          feature.id,
          feature,
        ]),
      ),
    [parkingSpot.parkingSpotFeatures],
  );

  return (
    <ParkingSpotModal
      open={open}
      title="Edit parking spot"
      submitLabel="Save changes"
      initialValues={{
        price: parkingSpot.price.toString(),
        parkingFeatureIds: parkingSpot.parkingSpotFeatures.map(
          (feature) => feature.id,
        ),
      }}
      initialSelectedFeatures={initialSelectedFeatures}
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
  initialValues,
  initialSelectedFeatures,
  successMessage,
  errorMessage,
  onOpenChange,
  onSubmit,
  onSubmitted,
}: ParkingSpotModalProps) {
  const getParkingFeaturesFn = useServerFn(getParkingFeatures);
  const [featureSearch, setFeatureSearch] = useState('');
  const [debouncedFeatureSearch, setDebouncedFeatureSearch] = useState('');
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [features, setFeatures] = useState<Array<ParkingFeatureOption>>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<string, ParkingFeatureOption>
  >(initialSelectedFeatures);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featuresError, setFeaturesError] = useState<string | null>(null);
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

  const selectedFeatureItems = useMemo(
    () =>
      form.state.values.parkingFeatureIds
        .map((featureId) => selectedFeatures[featureId])
        .filter((feature): feature is ParkingFeatureOption => Boolean(feature)),
    [form.state.values.parkingFeatureIds, selectedFeatures],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedFeatureSearch(featureSearch);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [featureSearch]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isActive = true;

    async function fetchParkingFeatures() {
      setFeaturesLoading(true);
      setFeaturesError(null);

      try {
        const response = await getParkingFeaturesFn({
          data: {
            page: 1,
            limit: PARKING_FEATURES_LIMIT,
            search: debouncedFeatureSearch,
            levels: ['PARKING_SPOT'],
          },
        });

        if (isActive) {
          setFeatures(response.data);
        }
      } catch {
        if (isActive) {
          setFeatures([]);
          setFeaturesError('Failed to load parking features.');
        }
      } finally {
        if (isActive) {
          setFeaturesLoading(false);
        }
      }
    }

    void fetchParkingFeatures();

    return () => {
      isActive = false;
    };
  }, [debouncedFeatureSearch, getParkingFeaturesFn, open]);

  function resetModalState() {
    form.reset();
    setFeatureSearch('');
    setDebouncedFeatureSearch('');
    setFeaturesOpen(false);
    setFeatures([]);
    setSelectedFeatures(initialSelectedFeatures);
    setFeaturesError(null);
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

              const toggleFeature = (feature: ParkingFeatureOption) => {
                setSelectedFeatures((previous) => ({
                  ...previous,
                  [feature.id]: feature,
                }));

                field.handleChange(
                  field.state.value.includes(feature.id)
                    ? field.state.value.filter((id) => id !== feature.id)
                    : [...field.state.value, feature.id],
                );
              };

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel>Parking features</FieldLabel>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto min-h-9 w-full justify-between gap-3 px-3 py-2 text-left font-normal"
                      aria-expanded={featuresOpen}
                      onClick={() => setFeaturesOpen((value) => !value)}
                    >
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate text-sm',
                          selectedFeatureItems.length === 0 &&
                            'text-muted-foreground',
                        )}
                      >
                        {selectedFeatureItems.length > 0
                          ? selectedFeatureItems
                              .map((feature) => feature.name)
                              .join(', ')
                          : 'Select parking features'}
                      </span>
                      <ChevronsUpDownIcon
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                    </Button>

                    {featuresOpen && (
                      <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
                        <div className="relative">
                          <SearchIcon
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            value={featureSearch}
                            onChange={(e) => setFeatureSearch(e.target.value)}
                            placeholder="Search parking features"
                            className="pl-9"
                            autoFocus
                          />
                        </div>

                        <div className="mt-2 max-h-60 overflow-y-auto">
                          {featuresLoading ? (
                            <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                              <Spinner className="size-4" />
                              Loading features
                            </div>
                          ) : featuresError ? (
                            <p className="px-2 py-3 text-sm text-destructive">
                              {featuresError}
                            </p>
                          ) : features.length > 0 ? (
                            <div className="space-y-1">
                              {features.map((feature) => {
                                const selected = field.state.value.includes(
                                  feature.id,
                                );

                                return (
                                  <button
                                    key={feature.id}
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                                    onClick={() => toggleFeature(feature)}
                                  >
                                    <span
                                      className={cn(
                                        'flex size-4 items-center justify-center rounded-sm border',
                                        selected &&
                                          'border-primary bg-primary text-primary-foreground',
                                      )}
                                    >
                                      {selected && (
                                        <CheckIcon
                                          aria-hidden="true"
                                          className="size-3"
                                        />
                                      )}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate">
                                      {feature.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="px-2 py-3 text-sm text-muted-foreground">
                              No features found.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedFeatureItems.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedFeatureItems.map((feature) => (
                        <button
                          key={feature.id}
                          type="button"
                          className="inline-flex max-w-full items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs font-medium"
                          onClick={() =>
                            field.handleChange(
                              field.state.value.filter(
                                (featureId) => featureId !== feature.id,
                              ),
                            )
                          }
                        >
                          <span className="truncate">{feature.name}</span>
                          <XIcon
                            aria-hidden="true"
                            className="size-3 shrink-0 text-muted-foreground"
                          />
                        </button>
                      ))}
                    </div>
                  )}

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
