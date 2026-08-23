import { NextRequest } from "next/server";
import { DriveFile, listFolderFiles } from "@/app/lib/googleDrive";
import { isValidAccessCode } from "@/app/lib/accessCode";

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

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Splits the time-sorted pool into buckets spanning the whole history and
// draws roughly one pick per bucket, so higher randomness spreads the batch
// across different points in time instead of risking a same-day clump.
function bucketedSample(sortedByTime: DriveFile[], n: number, randomness: number): DriveFile[] {
  const r = Math.min(100, Math.max(0, randomness)) / 100;
  const numBuckets = Math.max(1, Math.min(n, sortedByTime.length, Math.round(1 + r * (n - 1))));

  if (numBuckets <= 1 || sortedByTime.length === 0) {
    return sampleDistinct(sortedByTime, n);
  }

  const bucketSize = Math.ceil(sortedByTime.length / numBuckets);
  const buckets: DriveFile[][] = [];
  for (let i = 0; i < numBuckets; i++) {
    buckets.push(sortedByTime.slice(i * bucketSize, (i + 1) * bucketSize));
  }

  const picksPerBucket = new Array(numBuckets).fill(0);
  for (let i = 0; i < n; i++) picksPerBucket[i % numBuckets]++;

  const result: DriveFile[] = [];
  const usedIds = new Set<string>();
  buckets.forEach((bucket, i) => {
    const picked = sampleDistinct(bucket, picksPerBucket[i]);
    picked.forEach((f) => usedIds.add(f.id));
    result.push(...picked);
  });

  if (result.length < n) {
    const remaining = sortedByTime.filter((f) => !usedIds.has(f.id));
    result.push(...sampleDistinct(remaining, n - result.length));
  }

  return shuffle(result).slice(0, n);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  if (!isValidAccessCode(params.get("code"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const isAllFilter = filter === "all" && !hasCustomRange;

  let picked: DriveFile[];
  if (isAllFilter) {
    const rawRandomness = parseInt(params.get("randomness") || "0", 10);
    const randomness = Number.isFinite(rawRandomness) ? Math.min(100, Math.max(0, rawRandomness)) : 0;
    if (randomness <= 0) {
      picked = sampleDistinct(files, n);
    } else {
      const sortedByTime = [...files].sort(
        (a, b) => new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime()
      );
      picked = bucketedSample(sortedByTime, n, randomness);
    }
  } else {
    const sorted = [...files].sort(
      (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
    );
    const rawOffset = parseInt(params.get("offset") || "0", 10);
    const offset = sorted.length && Number.isFinite(rawOffset) ? ((rawOffset % sorted.length) + sorted.length) % sorted.length : 0;
    picked = [...sorted.slice(offset), ...sorted.slice(0, offset)].slice(0, n);
  }

  const code = encodeURIComponent(params.get("code")!);
  const photos = picked.map((f) => ({
    id: f.id,
    name: f.name,
    src: `/api/drive-media?id=${f.id}&code=${code}`,
    isVideo: f.mimeType.startsWith("video/"),
    createdTime: f.createdTime,
  }));

  return Response.json({ photos, total: files.length });
}
