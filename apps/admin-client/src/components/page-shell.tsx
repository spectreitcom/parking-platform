import type { ReactNode } from 'react';
import { cn } from '#/lib/utils';

type PageShellProps = Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}>;

export function PageShell({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: PageShellProps) {
  return (
    <section className={cn('space-y-6', className)}>
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

type ToolbarProps = Readonly<{
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}>;

export function Toolbar({ children, aside, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-card/82 p-3 shadow-sm shadow-black/[0.03] md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {aside && <div className="flex shrink-0 justify-end">{aside}</div>}
    </div>
  );
}

type EmptyStateProps = Readonly<{
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}>;

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-lg border border-dashed bg-card/55 px-6 py-14 text-center">
      {icon && (
        <div className="mb-5 flex size-12 items-center justify-center rounded-lg border bg-background text-primary shadow-xs">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
