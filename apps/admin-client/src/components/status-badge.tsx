import { Circle } from 'lucide-react';
import { cn } from '#/lib/utils';

const styles = {
  positive:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/12 dark:text-emerald-300',
  negative:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/12 dark:text-rose-300',
  info: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/12 dark:text-blue-300',
  neutral:
    'border-border bg-secondary text-secondary-foreground dark:bg-secondary/70',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/12 dark:text-amber-300',
} as const;

type StatusTone = keyof typeof styles;

type Props = Readonly<{
  children: string;
  tone?: StatusTone;
  className?: string;
}>;

export function StatusBadge({ children, tone = 'neutral', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        styles[tone],
        className,
      )}
    >
      <Circle className="size-1.5 fill-current" />
      {children}
    </span>
  );
}
