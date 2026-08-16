"use client";

import { useEffect, useRef } from "react";
import { suppressNextPopstate } from "./backNavigationSuppression";

/**
 * Makes the phone/browser back action close an overlay instead of leaving the page.
 * Pushes a history entry while `isOpen`, and closes via `onClose` when that entry is popped.
 */
export function useBackToClose(isOpen: boolean, onClose: () => void) {
  const pushedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen && !pushedRef.current) {
      window.history.pushState({ backToClose: true }, "");
      pushedRef.current = true;
    } else if (!isOpen && pushedRef.current) {
      pushedRef.current = false;
      if (window.history.state?.backToClose) {
        suppressNextPopstate();
        window.history.back();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (pushedRef.current) {
        pushedRef.current = false;
        onCloseRef.current();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
}
