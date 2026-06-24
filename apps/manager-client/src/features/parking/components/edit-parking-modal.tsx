'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useServerFn } from '@tanstack/react-start';
import {
  CheckIcon,
  ChevronsUpDownIcon,
  ImagePlusIcon,
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
import { Textarea } from '#/components/ui/textarea.tsx';
import { AssetImage } from '#/features/assets/components/asset-image.tsx';
import { uploadImage } from '#/features/assets/api';
import { getParkingFeatures } from '#/features/parking-features/api';
import type { parkingFeatureListItemSchema } from '#/features/parking-features/schemas';
import { updateParking } from '#/features/parking/api';
import type { parkingDetailSchema } from '#/features/parking/schemas';
import { cn } from '#/lib/utils.ts';

const PARKING_FEATURES_LIMIT = 20;

const editParkingFormSchema = z.object({
  name: z.string().max(255).trim(),
  description: z.string().trim(),
  statute: z.string().trim(),
  assetIds: z.array(z.uuid()),
  parkingFeatureIds: z.array(z.uuid()),
  imageFiles: z.array(z.file().max(2 * 1024 * 1024)),
});

type ParkingDetails = z.infer<typeof parkingDetailSchema>;
type ParkingFeatureOption = Pick<
  z.infer<typeof parkingFeatureListItemSchema>,
  'id' | 'name'
>;
type EditParkingFormValues = {
  name: string;
  description: string;
  statute: string;
  assetIds: Array<string>;
  parkingFeatureIds: Array<string>;
  imageFiles: Array<File>;
};

type EditParkingModalProps = Readonly<{
  open: boolean;
  parking: ParkingDetails;
  onOpenChange: (open: boolean) => void;
  onParkingUpdated: () => Promise<void> | void;
}>;

export function EditParkingModal({
  open,
  parking,
  onOpenChange,
  onParkingUpdated,
}: EditParkingModalProps) {
  const updateParkingFn = useServerFn(updateParking);
  const uploadImageFn = useServerFn(uploadImage);
  const getParkingFeaturesFn = useServerFn(getParkingFeatures);
  const [featureSearch, setFeatureSearch] = useState('');
  const [debouncedFeatureSearch, setDebouncedFeatureSearch] = useState('');
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [features, setFeatures] = useState<Array<ParkingFeatureOption>>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<string, ParkingFeatureOption>
  >(getInitialSelectedFeatures(parking));
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featuresError, setFeaturesError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: getParkingFormValues(parking),
    validators: {
      onSubmit: editParkingFormSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      try {
        const uploadedAssetIds = [];

        for (const file of value.imageFiles) {
          const formData = new FormData();
          formData.append('file', file);

          const response = await uploadImageFn({ data: formData });
          uploadedAssetIds.push(response.id);
        }

        await updateParkingFn({
          data: {
            parkingId: parking.id,
            name: value.name.trim(),
            description: value.description,
            statute: value.statute,
            assetIds: [...value.assetIds, ...uploadedAssetIds],
            parkingFeatureIds: value.parkingFeatureIds,
            parkingAddonIds: parking.parkingAddons.map((addon) => addon.id),
            version: parking.version,
          },
        });

        toast.success('Parking updated');
        resetModalState();
        onOpenChange(false);
        await onParkingUpdated();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update parking',
        );
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
    if (!open) {
      return;
    }

    form.reset(getParkingFormValues(parking));
    setSelectedFeatures(getInitialSelectedFeatures(parking));
  }, [form, open, parking]);

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
            levels: ['PARKING'],
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
    form.reset(getParkingFormValues(parking));
    setFeatureSearch('');
    setDebouncedFeatureSearch('');
    setFeaturesOpen(false);
    setFeatures([]);
    setSelectedFeatures(getInitialSelectedFeatures(parking));
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
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
            <ParkingSquareIcon aria-hidden="true" className="size-5" />
          </div>
          <DialogTitle>Edit parking</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <form.Field
            name="name"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="description"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="statute"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Statute</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
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
                            onChange={(event) =>
                              setFeatureSearch(event.target.value)
                            }
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

          <form.Field
            name="assetIds"
            children={(assetField) => (
              <form.Field
                name="imageFiles"
                children={(imageField) => {
                  const isInvalid =
                    imageField.state.meta.isTouched &&
                    !imageField.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={imageField.name}>Images</FieldLabel>
                      <div className="space-y-3 rounded-md border border-dashed p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 text-sm">
                            <p className="font-medium">
                              {assetField.state.value.length} linked assets
                            </p>
                            <p className="text-muted-foreground">
                              PNG, JPEG, WebP, GIF or TIFF up to 2 MB.
                            </p>
                          </div>
                          <Button type="button" variant="outline" asChild>
                            <label htmlFor={imageField.name}>
                              <ImagePlusIcon aria-hidden="true" />
                              Add images
                            </label>
                          </Button>
                          <Input
                            id={imageField.name}
                            name={imageField.name}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif,image/tiff"
                            multiple
                            className="sr-only"
                            onBlur={imageField.handleBlur}
                            onChange={(event) =>
                              imageField.handleChange(
                                Array.from(event.target.files ?? []),
                              )
                            }
                          />
                        </div>

                        {assetField.state.value.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {assetField.state.value.map((assetId) => (
                              <div
                                key={assetId}
                                className="group relative overflow-hidden rounded-md"
                              >
                                <AssetImage
                                  assetId={assetId}
                                  alt="Linked parking asset"
                                  width={320}
                                  height={180}
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  className="absolute right-1.5 top-1.5 size-7 shadow-sm"
                                  aria-label="Remove image"
                                  onClick={() =>
                                    assetField.handleChange(
                                      assetField.state.value.filter(
                                        (id) => id !== assetId,
                                      ),
                                    )
                                  }
                                >
                                  <XIcon aria-hidden="true" className="size-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {imageField.state.value.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium uppercase text-muted-foreground">
                              Ready to upload
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {imageField.state.value.map((file) => (
                                <button
                                  key={`${file.name}-${file.lastModified}`}
                                  type="button"
                                  className="inline-flex max-w-full items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs font-medium"
                                  onClick={() =>
                                    imageField.handleChange(
                                      imageField.state.value.filter(
                                        (item) => item !== file,
                                      ),
                                    )
                                  }
                                >
                                  <span className="max-w-48 truncate">
                                    {file.name}
                                  </span>
                                  <XIcon
                                    aria-hidden="true"
                                    className="size-3 shrink-0 text-muted-foreground"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {isInvalid && (
                        <FieldError errors={imageField.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            )}
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
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getParkingFormValues(parking: ParkingDetails): EditParkingFormValues {
  return {
    name: parking.name,
    description: parking.description,
    statute: parking.statute,
    assetIds: parking.assetIds,
    parkingFeatureIds: parking.parkingFeatures.map((feature) => feature.id),
    imageFiles: [],
  };
}

function getInitialSelectedFeatures(
  parking: ParkingDetails,
): Record<string, ParkingFeatureOption> {
  return Object.fromEntries(
    parking.parkingFeatures.map((feature) => [feature.id, feature]),
  );
}
