import { useState, useCallback } from "react";

interface UseShakeReturn {
  shaking: boolean;
  triggerShake: () => void;
}

export function useShake(duration = 500): UseShakeReturn {
  const [shaking, setShaking] = useState(false);

  const triggerShake = useCallback(() => {
    setShaking(true);
    const timer = setTimeout(() => setShaking(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return { shaking, triggerShake };
}
