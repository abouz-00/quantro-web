import { cn } from '../utils';

describe('Utils', () => {
  it('combines class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles undefined values', () => {
    const result = cn('class1', undefined, 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
