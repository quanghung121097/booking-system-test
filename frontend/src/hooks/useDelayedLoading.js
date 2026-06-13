import { useEffect, useState } from 'react';

/** Tránh nháy spinner khi request quá nhanh. */
export function useDelayedLoading(isLoading, delayMs = 180) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShow(false);
      return undefined;
    }

    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [isLoading, delayMs]);

  return show;
}
