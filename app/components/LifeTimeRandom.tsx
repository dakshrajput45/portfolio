"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LifeTimeRandomHeader, { DEFAULT_N, FilterValue, MAX_N, MIN_N } from "./LifeTimeRandomHeader";
import LifeTimeRandomSlides, { Photo } from "./LifeTimeRandomSlides";

const SWIPE_THRESHOLD = 50;
const RETRY_DELAY_MS = 600;
const ERROR_TOAST_MESSAGE = "Something got errored, retry once or call your baby once, cutie 💕";

export default function LifeTimeRandom({
  accessCode,
  onClose,
}: {
  accessCode: string;
  onClose: () => void;
}) {
  const [n, setN] = useState(DEFAULT_N);
  const [nInput, setNInput] = useState(String(DEFAULT_N));
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [light, setLight] = useState(true);
  const [batch, setBatch] = useState(0);
  const [isNarrow, setIsNarrow] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<"like" | "dislike" | null>(null);
  const [pageOffset, setPageOffset] = useState(0);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [slideshow, setSlideshow] = useState(false);
  const [paused, setPaused] = useState(false);
  const [intervalSec, setIntervalSec] = useState(4);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastFetchParamsRef = useRef<{
    count: number;
    filterValue: string;
    start: string;
    end: string;
    offset: number;
  } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fetchPhotos = useCallback(
    async (count: number, filterValue: string, start: string, end: string, offset: number) => {
      lastFetchParamsRef.current = { count, filterValue, start, end, offset };
      setLoading(true);
      setError(null);
      const isAll = filterValue === "all" && !start && !end;
      const url = (() => {
        const qs = new URLSearchParams({ n: String(count), code: accessCode });
        if (start || end) {
          if (start) qs.set("startDate", start);
          if (end) qs.set("endDate", end);
          qs.set("offset", String(offset));
        } else {
          qs.set("filter", filterValue);
          if (filterValue !== "all") qs.set("offset", String(offset));
        }
        return `/api/random-photos?${qs}`;
      })();

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to load photos");
          const data = await res.json();
          const fetched = data.photos as Omit<Photo, "rotation">[];
          setPhotos(fetched.map((p) => ({ ...p, rotation: 0 })));
          setCurrentIndex(0);
          setBatch((b) => b + 1);
          setPageOffset(isAll ? 0 : offset);
          setLoading(false);
          return;
        } catch {
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          }
        }
      }

      setError(ERROR_TOAST_MESSAGE);
      setLoading(false);
    },
    [accessCode]
  );

  useEffect(() => {
    fetchPhotos(DEFAULT_N, "all", "", "", 0);
  }, [fetchPhotos]);

  const rotatePhoto = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const updateN = (value: number) => {
    const clamped = Math.min(MAX_N, Math.max(MIN_N, value));
    setN(clamped);
    setNInput(String(clamped));
  };

  const isAllFilter = filter === "all" && !startDate && !endDate;
  const nextPageOffset = isAllFilter ? 0 : pageOffset + n;

  const goPrev = () => setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  const goNext = useCallback(() => {
    if (currentIndex >= photos.length - 1) {
      fetchPhotos(n, filter, startDate, endDate, nextPageOffset);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, photos.length, fetchPhotos, n, filter, startDate, endDate, nextPageOffset]);

  useEffect(() => {
    if (!slideshow || paused || selectedPhoto || loading || photos.length === 0) return;
    const timer = setTimeout(() => {
      if (isNarrow) {
        goNext();
      } else {
        fetchPhotos(n, filter, startDate, endDate, nextPageOffset);
      }
    }, intervalSec * 1000);
    return () => clearTimeout(timer);
  }, [
    slideshow,
    paused,
    selectedPhoto,
    loading,
    intervalSec,
    currentIndex,
    photos.length,
    isNarrow,
    goNext,
    fetchPhotos,
    n,
    filter,
    startDate,
    endDate,
    nextPageOffset,
  ]);

  useEffect(() => {
    if (selectedPhoto && slideshow) setPaused(true);
  }, [selectedPhoto, slideshow]);

  const handlePhotoTap = (photo: Photo) => {
    if (!slideshow) {
      setSelectedPhoto(photo);
      return;
    }
    if (paused) setSelectedPhoto(photo);
    else setPaused(true);
  };

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => {
      goNext();
      setDragX(0);
      setDragY(0);
      setExiting(null);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exiting]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (exiting) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    setDragX(e.touches[0].clientX - touchStartX.current);
    setDragY(e.touches[0].clientY - touchStartY.current);
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD) setExiting("like");
    else if (dragX < -SWIPE_THRESHOLD) setExiting("dislike");
    else {
      setDragX(0);
      setDragY(0);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const cardDragStyle: React.CSSProperties = exiting
    ? {
        transform: `translate(${exiting === "like" ? "130%" : "-130%"}, ${dragY}px) rotate(${
          exiting === "like" ? 24 : -24
        }deg) scale(1.03)`,
        transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease-out",
        opacity: 0,
        willChange: "transform, opacity",
        touchAction: "pan-y",
      }
    : {
        transform: `translate(${dragX}px, ${dragY}px) rotate(${dragX / 20}deg) scale(${dragging ? 1.03 : 1})`,
        transition: dragging ? "transform 0.05s linear" : "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
        willChange: "transform",
        touchAction: "pan-y",
      };

  const likeOpacity = exiting === "like" ? 1 : Math.min(Math.max(dragX, 0) / 100, 1);
  const dislikeOpacity = exiting === "dislike" ? 1 : Math.min(Math.max(-dragX, 0) / 100, 1);

  const showSingle = isNarrow;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden px-3 py-3 sm:px-4 sm:py-4 transition-colors duration-300 ${
        light ? "bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-gray-900" : "bg-black text-white"
      }`}
    >
      <div className={`absolute -top-1/2 -left-1/2 h-[200%] w-[200%] animate-spin-slow ${light ? "opacity-10" : "opacity-20"}`}>
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-center gap-4 sm:gap-5">
        <LifeTimeRandomHeader
          light={light}
          onClose={onClose}
          onToggleLight={() => setLight((v) => !v)}
          slideshow={slideshow}
          paused={paused}
          intervalSec={intervalSec}
          onToggleSlideshow={() => {
            setSlideshow((v) => !v);
            setPaused(false);
          }}
          onTogglePause={() => setPaused((p) => !p)}
          onIntervalChange={setIntervalSec}
          n={n}
          nInput={nInput}
          onDecrement={() => updateN(n - 1)}
          onIncrement={() => updateN(n + 1)}
          onNInputChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            setNInput(raw);
            const parsed = Number(raw);
            if (raw !== "" && Number.isFinite(parsed)) {
              setN(Math.min(MAX_N, Math.max(MIN_N, parsed)));
            }
          }}
          onNInputBlur={() => {
            const parsed = Number(nInput);
            const clamped =
              nInput !== "" && Number.isFinite(parsed)
                ? Math.min(MAX_N, Math.max(MIN_N, parsed))
                : DEFAULT_N;
            setN(clamped);
            setNInput(String(clamped));
          }}
          filter={filter}
          onFilterChange={(value) => {
            setFilter(value);
            setPageOffset(0);
          }}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(value) => {
            setStartDate(value);
            setPageOffset(0);
          }}
          onEndDateChange={(value) => {
            setEndDate(value);
            setPageOffset(0);
          }}
        />

        <LifeTimeRandomSlides
          photos={photos}
          batch={batch}
          currentIndex={currentIndex}
          light={light}
          loading={loading}
          isNarrow={isNarrow}
          showSingle={showSingle}
          selectedPhoto={selectedPhoto}
          setSelectedPhoto={setSelectedPhoto}
          onPhotoTap={handlePhotoTap}
          onRotatePhoto={rotatePhoto}
          goPrev={goPrev}
          goNext={goNext}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          cardDragStyle={cardDragStyle}
          likeOpacity={likeOpacity}
          dislikeOpacity={dislikeOpacity}
          isAllFilter={isAllFilter}
          onFetchAll={() => fetchPhotos(n, "all", "", "", 0)}
          onPrevPage={() => fetchPhotos(n, filter, startDate, endDate, pageOffset - n)}
          onNextPage={() => fetchPhotos(n, filter, startDate, endDate, pageOffset + n)}
        />
      </div>

      {error && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
          <div
            className={`pointer-events-auto flex items-center gap-3 rounded-full border-2 px-5 py-3 text-sm shadow-2xl backdrop-blur-sm ${
              light
                ? "border-pink-300/60 bg-white/90 text-gray-700"
                : "border-pink-300/40 bg-black/80 text-white"
            }`}
          >
            <span>{error}</span>
            <button
              onClick={() => {
                const p = lastFetchParamsRef.current;
                if (p) fetchPhotos(p.count, p.filterValue, p.start, p.end, p.offset);
              }}
              className="shrink-0 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 px-3 py-1 font-medium text-white cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss"
              className={light ? "shrink-0 text-gray-400 cursor-pointer" : "shrink-0 text-white/50 cursor-pointer"}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
