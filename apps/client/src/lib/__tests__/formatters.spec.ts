import { describe, expect, it } from 'vitest';
import {
  formatDateTime,
  formatPln,
  formatUnixDateTime,
  shortId,
} from '#/lib/formatters.ts';

describe('presentation formatters', () => {
  it('formats PLN amounts using the Polish locale', () => {
    expect(formatPln(1234.5)).toBe(
      new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
      }).format(1234.5),
    );
  });

  it('formats Date instances and Unix timestamps consistently', () => {
    const date = new Date('2026-07-10T10:15:00.000Z');

    expect(formatUnixDateTime(date.getTime() / 1000)).toBe(
      formatDateTime(date),
    );
  });

  it('creates a short, uppercase identifier', () => {
    expect(shortId('abcdef12-3456-7890')).toBe('ABCDEF12');
    expect(shortId('abcdef12-3456-7890', 4)).toBe('ABCD');
  });
});
