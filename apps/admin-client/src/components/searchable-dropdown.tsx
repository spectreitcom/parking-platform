'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Input } from '#/components/ui/input';
import { Spinner } from '#/components/ui/spinner';
import { cn } from '#/lib/utils';

export type SearchableOption = Readonly<{
  id: string;
  label: string;
  description?: string;
}>;

type Props = Readonly<{
  id: string;
  selectedOption: SearchableOption | null;
  options: SearchableOption[];
  search: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  loadingLabel: string;
  isInvalid: boolean;
  isLoading: boolean;
  error: string | null;
  onSearchChange: (search: string) => void;
  onChange: (option: SearchableOption) => void;
}>;

export function SearchableDropdown({
  id,
  selectedOption,
  options,
  search,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  loadingLabel,
  isInvalid,
  isLoading,
  error,
  onSearchChange,
  onChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40',
          !selectedOption && 'text-muted-foreground',
        )}
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={isInvalid}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </button>

      {isOpen ? (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1.5 text-popover-foreground shadow-md">
          <div className="relative mb-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-9 pl-9"
              autoFocus
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div
            id={listboxId}
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                {loadingLabel}
              </div>
            ) : error ? (
              <p className="px-2 py-2 text-sm text-destructive">{error}</p>
            ) : options.length === 0 ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">
                {emptyLabel}
              </p>
            ) : (
              options.map((option) => {
                const isSelected = selectedOption?.id === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className="flex w-full items-start gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {option.label}
                      </span>
                      {option.description ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
