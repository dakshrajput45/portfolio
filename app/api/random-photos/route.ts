import { NextRequest } from "next/server";
import { DriveFile, listFolderFiles } from "@/app/lib/googleDrive";

const MIN_N = 1;
const MAX_N = 9;
const DEFAULT_N = 3;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function sampleDistinct<T>(items: T[], n: number): T[] {
  const pool = [...items];
  const result: T[] = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const raw = params.get("n");
  const parsed = raw ? parseInt(raw, 10) : DEFAULT_N;
  const n = Math.min(MAX_N, Math.max(MIN_N, Number.isFinite(parsed) ? parsed : DEFAULT_N));

  const filter = params.get("filter") || "all";
  const startDateParam = params.get("startDate");
  const endDateParam = params.get("endDate");

  let files: DriveFile[];
  try {
    files = await listFolderFiles();
  } catch (err) {
    console.error("Failed to list Drive folder:", err);
    return Response.json({ error: "Failed to load photos" }, { status: 502 });
  }

  const hasCustomRange = Boolean(startDateParam || endDateParam);

  if (hasCustomRange) {
    const start = startDateParam ? new Date(startDateParam) : null;
    const end = endDateParam ? new Date(`${endDateParam}T23:59:59.999`) : null;
    files = files.filter((f) => {
      const t = new Date(f.createdTime).getTime();
      if (start && t < start.getTime()) return false;
      if (end && t > end.getTime()) return false;
      return true;
    });
  } else if (filter === "week") {
    const cutoff = Date.now() - WEEK_MS;
    files = files.filter((f) => new Date(f.createdTime).getTime() >= cutoff);
  } else if (filter === "month") {
    const cutoff = Date.now() - MONTH_MS;
    files = files.filter((f) => new Date(f.createdTime).getTime() >= cutoff);
  }

  let picked: DriveFile[];
  if (filter === "newest" && !hasCustomRange) {
    picked = [...files]
      .sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
      .slice(0, n);
  } else {
    picked = sampleDistinct(files, n);
  }

  const photos = picked.map((f) => ({
    id: f.id,
    name: f.name,
    src: `/api/drive-media?id=${f.id}`,
    isVideo: f.mimeType.startsWith("video/"),
  }));

  return Response.json({ photos, total: files.length });
}
