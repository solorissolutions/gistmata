"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const register = () => {
      const run = () => {
        void navigator.serviceWorker.register("/sw.js");
      };

      if (
        typeof idleWindow.requestIdleCallback === "function" &&
        typeof idleWindow.cancelIdleCallback === "function"
      ) {
        const idleId = idleWindow.requestIdleCallback(run, { timeout: 2000 });
        return () => idleWindow.cancelIdleCallback?.(idleId);
      }

      const timeoutId = globalThis.setTimeout(run, 600);
      return () => globalThis.clearTimeout(timeoutId);
    };

    if (document.readyState === "complete") {
      return register();
    }

    const onLoad = () => {
      register();
    };

    window.addEventListener("load", onLoad, { once: true });

    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
