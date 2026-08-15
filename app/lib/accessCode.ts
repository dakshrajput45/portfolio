const UNLOCK_CODE = process.env.NEXT_PUBLIC_UNLOCK_CODE || "1725";
const SHORTCUT_CODE = process.env.NEXT_PUBLIC_SHORTCUT_CODE || "vani";

export function isValidAccessCode(code: string | null): boolean {
  if (!code) return false;
  return code === UNLOCK_CODE || code.toLowerCase() === SHORTCUT_CODE.toLowerCase();
}
