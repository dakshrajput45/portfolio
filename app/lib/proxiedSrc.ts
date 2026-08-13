export function proxiedSrc(src: string): string {
  if (!src) return "";
  if (src.includes("drive.google.com")) {
    return `/api/photo?src=${encodeURIComponent(src)}`;
  }
  return src;
}
