// frontend/src/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a value.
 * This prevents API calls on every keystroke.
 * @param value The value to debounce (e.g., a search term)
 * @param delay The delay in milliseconds (e.g., 500)
 */
export const useDebounce = (value: string, delay: number) => {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};