"use client";

import { useEffect, useRef } from "react";
import { consumeSuppressedPopstate } from "./backNavigationSuppression";

const EXIT_WINDOW_MS = 2000;

/**
 * When `active`, the first back press is absorbed (history re-pushed) and
 * fires `onWarn`; a second back press within the window calls `onExit`.
 * Stay inactive while any overlay above this level owns the back press.
 */
export function useDoubleBackToExit(active: boolean, onExit: () => void, onWarn: () => void) {
  const armedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (active && !pushedRef.current) {
      window.history.pushState({ ltrRoot: true }, "");
      pushedRef.current = true;
    }
  }, [active]);

  useEffect(() => {
    const handlePopState = () => {
      if (consumeSuppressedPopstate()) return;
      if (!active) return;
      if (armedRef.current) {
        armedRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
        onExit();
        return;
      }
      armedRef.current = true;
      onWarn();
      window.history.pushState({ ltrRoot: true }, "");
      timerRef.current = setTimeout(() => {
        armedRef.current = false;
      }, EXIT_WINDOW_MS);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, onExit, onWarn]);
}
