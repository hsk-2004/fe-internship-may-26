import { useState, useEffect } from 'react'

/**
 * A reusable hook that debounces a value by the given delay.
 * Returns the debounced value, which only updates after the
 * user stops changing the input for `delay` milliseconds.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timerId)
    }
  }, [value, delay])

  return debouncedValue
}
