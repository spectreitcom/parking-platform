import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSearchParams<T extends Record<string, string | number>>(
  data: T,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(data)) {
    if (value) {
      searchParams.append(key, value.toString());
    }
  }

  return searchParams;
}
