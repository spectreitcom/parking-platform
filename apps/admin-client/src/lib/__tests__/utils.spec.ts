import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional class names', () => {
    const isTrue = true as boolean;
    const isFalse = false as boolean;
    expect(cn('class1', isTrue && 'class2', isFalse && 'class3')).toBe(
      'class1 class2',
    );
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-2', 'px-4')).toBe('py-2 px-4');
  });
});
