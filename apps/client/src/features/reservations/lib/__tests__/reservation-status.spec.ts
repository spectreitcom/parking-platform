import { describe, expect, it } from 'vitest';
import {
  getReservationStatusKind,
  getReservationStatusLabel,
  isReservationCancelled,
} from '#/features/reservations/lib/reservation-status.ts';

describe('reservation status presentation', () => {
  it.each([
    ['cancelled', 'cancelled', 'Anulowana'],
    ['CONFIRMED', 'confirmed', 'Potwierdzona'],
    ['active', 'confirmed', 'Potwierdzona'],
    ['completed', 'completed', 'Zakończona'],
    ['finished', 'completed', 'Zakończona'],
    ['pending_payment', 'pending', 'Oczekująca'],
  ] as const)('maps %s to its presentation', (status, kind, label) => {
    expect(getReservationStatusKind(status)).toBe(kind);
    expect(getReservationStatusLabel(status)).toBe(label);
  });

  it('preserves an unknown status label', () => {
    expect(getReservationStatusKind('refunded')).toBe('unknown');
    expect(getReservationStatusLabel('refunded')).toBe('refunded');
  });

  it('recognizes cancelled reservations case-insensitively', () => {
    expect(isReservationCancelled('CANCELLED_BY_USER')).toBe(true);
    expect(isReservationCancelled('confirmed')).toBe(false);
  });
});
