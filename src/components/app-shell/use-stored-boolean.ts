"use client";

import {
  useCallback,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";

export function useStoredBoolean(key: string, initialValue: boolean) {
  const eventName = `gm-storage:${key}`;

  const getSnapshot = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === "1") {
        return true;
      }
      if (raw === "0") {
        return false;
      }
    } catch {
      return initialValue;
    }

    return initialValue;
  }, [initialValue, key]);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") {
        return () => undefined;
      }

      const handleChange = () => callback();

      window.addEventListener("storage", handleChange);
      window.addEventListener(eventName, handleChange);

      return () => {
        window.removeEventListener("storage", handleChange);
        window.removeEventListener(eventName, handleChange);
      };
    },
    [eventName],
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, () => initialValue);

  const setValue: Dispatch<SetStateAction<boolean>> = useCallback(
    (nextValue) => {
      if (typeof window === "undefined") {
        return;
      }

      const resolvedValue =
        typeof nextValue === "function"
          ? nextValue(getSnapshot())
          : nextValue;

      try {
        window.localStorage.setItem(key, resolvedValue ? "1" : "0");
      } catch {
        return;
      }

      window.dispatchEvent(new Event(eventName));
    },
    [eventName, getSnapshot, key],
  );

  return [value, setValue] as const;
}
