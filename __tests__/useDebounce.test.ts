import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 200 } }
    );

    rerender({ value: 'b', delay: 200 });

    expect(result.current).toBe('a');

    act(() => { jest.advanceTimersByTime(199); });
    expect(result.current).toBe('a');

    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current).toBe('b');
  });
});
