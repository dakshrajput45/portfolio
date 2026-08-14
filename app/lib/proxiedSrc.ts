export function proxiedSrc(src: string): string {
  if (!src) return "";
  if (src.includes("drive.google.com")) {
    return `/api/photo?src=${encodeURIComponent(src)}`;
  }
  return src;
}

export function isVideoSrc(src: string): boolean {
  if (!src) return false;
  return /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(src);
}
