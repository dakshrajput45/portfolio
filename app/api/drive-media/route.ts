import { NextRequest } from "next/server";
import { fetchDriveMedia } from "@/app/lib/googleDrive";
import { isValidAccessCode } from "@/app/lib/accessCode";

const VALID_ID = /^[a-zA-Z0-9_-]+$/;
const BLOCKED_CONTENT_TYPES = new Set(["image/svg+xml"]);

export async function GET(request: NextRequest) {
  if (!isValidAccessCode(request.nextUrl.searchParams.get("code"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !VALID_ID.test(id)) {
    return new Response("Invalid id", { status: 400 });
  }

  const range = request.headers.get("range");
  let driveRes: Response;
  try {
    driveRes = await fetchDriveMedia(id, range);
  } catch (err) {
    console.error("Drive media fetch failed:", err);
    return new Response("Failed to fetch media", { status: 502 });
  }

  if (!driveRes.ok || !driveRes.body) {
    return new Response("Media not found", { status: driveRes.status || 404 });
  }

  const contentType = driveRes.headers.get("content-type") ?? "";
  if (!/^(image|video)\//.test(contentType) || BLOCKED_CONTENT_TYPES.has(contentType)) {
    return new Response("Unsupported content type", { status: 415 });
  }

  const headers = new Headers({
    "content-type": contentType,
    "content-disposition": "inline",
    "x-content-type-options": "nosniff",
    "cache-control": "private, max-age=86400, immutable",
  });
  for (const name of ["content-range", "accept-ranges", "content-length"]) {
    const value = driveRes.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(driveRes.body, { status: driveRes.status, headers });
}
