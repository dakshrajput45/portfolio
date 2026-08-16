let suppressCount = 0;

/**
 * Call right before a programmatic `history.back()` so the popstate it
 * triggers isn't mistaken for a real user back-button press by other
 * back-handling hooks (e.g. useDoubleBackToExit).
 */
export function suppressNextPopstate() {
  suppressCount++;
}

export function consumeSuppressedPopstate(): boolean {
  if (suppressCount > 0) {
    suppressCount--;
    return true;
  }
  return false;
}
