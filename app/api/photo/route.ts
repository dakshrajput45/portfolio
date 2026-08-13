import { NextRequest } from "next/server";

function extractDriveFileId(url: string): string | null {
  const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");
  if (!src) {
    return new Response("Missing src", { status: 400 });
  }

  const fileId = extractDriveFileId(src);
  const fetchUrl = fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : src;

  const range = request.headers.get("range");
  const driveRes = await fetch(fetchUrl, range ? { headers: { range } } : undefined);
  if (!driveRes.ok || !driveRes.body) {
    return new Response("Media not found", { status: 404 });
  }

  const headers = new Headers({
    "content-type": driveRes.headers.get("content-type") ?? "application/octet-stream",
    "cache-control": "public, max-age=86400, immutable",
  });
  for (const name of ["content-range", "accept-ranges", "content-length"]) {
    const value = driveRes.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(driveRes.body, { status: driveRes.status, headers });
}
