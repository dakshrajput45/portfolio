"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LifeTimeRandomHeaderDesktop from "./LifeTimeRandomHeaderDesktop";
import LifeTimeRandomHeaderMobile from "./LifeTimeRandomHeaderMobile";
import LifeTimeRandomMobileBottomNav from "./LifeTimeRandomMobileBottomNav";
import {
  accentGradientClass,
  DEFAULT_N,
  FilterValue,
  MAX_MASONRY_COLS,
  MAX_N,
  MIN_MASONRY_COLS,
  MIN_N,
} from "./LifeTimeRandomHeaderShared";
import LifeTimeRandomSlides, { LifeTimeRandomSlidesHandle, Photo } from "./LifeTimeRandomSlides";
import { useBackToClose } from "../lib/useBackToClose";
import { useDoubleBackToExit } from "../lib/useDoubleBackToExit";

const SWIPE_THRESHOLD = 50;
const RETRY_DELAY_MS = 600;
const SLIDESHOW_INTERVAL_SEC = 4;
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
  const [randomness, setRandomness] = useState(25);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [slideshow, setSlideshow] = useState(false);
  const [paused, setPaused] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sharingSelected, setSharingSelected] = useState(false);
  const [pinterestMode, setPinterestMode] = useState(false);
  const [masonryCols, setMasonryCols] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBackHint, setShowBackHint] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastFetchParamsRef = useRef<{
    count: number;
    filterValue: string;
    start: string;
    end: string;
    offset: number;
    randomnessValue: number;
  } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fetchPhotos = useCallback(
    async (
      count: number,
      filterValue: string,
      start: string,
      end: string,
      offset: number,
      randomnessValue: number,
      append = false
    ) => {
      lastFetchParamsRef.current = { count, filterValue, start, end, offset, randomnessValue };
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
          else qs.set("randomness", String(randomnessValue));
        }
        return `/api/random-photos?${qs}`;
      })();

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to load photos");
          const data = await res.json();
          const fetched = data.photos as Omit<Photo, "rotation">[];
          const withRotation = fetched.map((p) => ({ ...p, rotation: 0 }));
          if (append) {
            setPhotos((prev) => [...prev, ...withRotation]);
          } else {
            setPhotos(withRotation);
            setCurrentIndex(0);
            setSelectedIds(new Set());
          }
          fetched.forEach((p) => {
            if (!p.isVideo) {
              const img = new window.Image();
              img.src = p.src;
            }
          });
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
    fetchPhotos(DEFAULT_N, "all", "", "", 0, 25);
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
    setPageOffset(0);
    fetchPhotos(clamped, filter, startDate, endDate, 0, randomness);
  };

  const updateMasonryCols = (value: number) => {
    setMasonryCols(Math.min(MAX_MASONRY_COLS, Math.max(MIN_MASONRY_COLS, value)));
  };

  const selectAllPhotos = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map((p) => p.id)));
    }
  };

  const toggleSelectPhoto = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [screenshotCapturing, setScreenshotCapturing] = useState(false);
  const [screenshotMenuOpen, setScreenshotMenuOpen] = useState(false);
  const slidesRef = useRef<LifeTimeRandomSlidesHandle>(null);
  const handleScreenshotCapture = async (mode: "share" | "download") => {
    if (screenshotCapturing) return;
    setScreenshotMenuOpen(false);
    setScreenshotCapturing(true);
    try {
      await slidesRef.current?.captureScreenshot(mode);
    } finally {
      setScreenshotCapturing(false);
    }
  };

  const shareSelectedPhotos = async () => {
    const selected = photos.filter((p) => selectedIds.has(p.id));
    if (selected.length === 0) return;
    setSharingSelected(true);
    try {
      const files = await Promise.all(
        selected.map(async (p) => {
          const res = await fetch(p.src);
          const blob = await res.blob();
          return new File([blob], p.name, { type: blob.type });
        })
      );

      if (navigator.canShare?.({ files })) {
        await navigator.share({ files });
        setSharingSelected(false);
        return;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setSharingSelected(false);
        return;
      }
      console.error("Multi-share failed:", err);
    }
    selected.forEach((p) => window.open(p.src, "_blank"));
    setSharingSelected(false);
  };

  const isAllFilter = filter === "all" && !startDate && !endDate;
  const nextPageOffset = isAllFilter ? 0 : pageOffset + n;

  const goPrev = () => setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  const goNext = useCallback(() => {
    if (currentIndex >= photos.length - 1) {
      fetchPhotos(n, filter, startDate, endDate, nextPageOffset, randomness);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, photos.length, fetchPhotos, n, filter, startDate, endDate, nextPageOffset, randomness]);

  useEffect(() => {
    if (!slideshow || paused || selectedPhoto || loading || photos.length === 0) return;
    const timer = setTimeout(() => {
      if (isNarrow) {
        goNext();
      } else {
        fetchPhotos(n, filter, startDate, endDate, nextPageOffset, randomness);
      }
    }, SLIDESHOW_INTERVAL_SEC * 1000);
    return () => clearTimeout(timer);
  }, [
    slideshow,
    paused,
    selectedPhoto,
    loading,
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
    randomness,
  ]);

  useEffect(() => {
    if (selectedPhoto && slideshow) setPaused(true);
  }, [selectedPhoto, slideshow]);

  const closePhotoDetail = () => {
    setSelectedPhoto(null);
    if (slideshow) setPaused(false);
  };

  useBackToClose(!!selectedPhoto, closePhotoDetail);
  useBackToClose(sidebarOpen, () => setSidebarOpen(false));
  useDoubleBackToExit(
    isNarrow && !selectedPhoto && !sidebarOpen,
    onClose,
    () => {
      setShowBackHint(true);
      setTimeout(() => setShowBackHint(false), 2000);
    }
  );

  const goToAdjacentPhoto = (direction: 1 | -1) => {
    if (!selectedPhoto || photos.length === 0) return;
    const idx = photos.findIndex((p) => p.id === selectedPhoto.id);
    if (idx === -1) return;
    setSelectedPhoto(photos[(idx + direction + photos.length) % photos.length]);
  };

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

  const showSingle = isNarrow && !pinterestMode;

  const headerControlsProps = {
    light,
    slideshow,
    paused,
    onToggleSlideshow: () => {
      setSlideshow((v) => !v);
      setPaused(false);
    },
    onTogglePause: () => setPaused((p) => !p),
    n,
    nInput,
    onDecrement: () => updateN(n - 1),
    onIncrement: () => updateN(n + 1),
    onNInputChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      setNInput(raw);
      const parsed = Number(raw);
      if (raw !== "" && Number.isFinite(parsed)) {
        setN(Math.min(MAX_N, Math.max(MIN_N, parsed)));
      }
    },
    onNInputBlur: () => {
      const parsed = Number(nInput);
      const clamped =
        nInput !== "" && Number.isFinite(parsed) ? Math.min(MAX_N, Math.max(MIN_N, parsed)) : DEFAULT_N;
      setN(clamped);
      setNInput(String(clamped));
      if (clamped !== n) {
        setPageOffset(0);
        fetchPhotos(clamped, filter, startDate, endDate, 0, randomness);
      }
    },
    filter,
    onFilterChange: (value: FilterValue) => {
      setFilter(value);
      setPageOffset(0);
      if (value !== "custom") {
        fetchPhotos(n, value, "", "", 0, randomness);
      }
    },
    startDate,
    endDate,
    onStartDateChange: (value: string) => {
      setStartDate(value);
      setPageOffset(0);
      fetchPhotos(n, filter, value, endDate, 0, randomness);
    },
    onEndDateChange: (value: string) => {
      setEndDate(value);
      setPageOffset(0);
      fetchPhotos(n, filter, startDate, value, 0, randomness);
    },
    randomness,
    onRandomnessChange: setRandomness,
    selectedCount: selectedIds.size,
    totalCount: photos.length,
    onSelectAll: selectAllPhotos,
    onShareSelected: shareSelectedPhotos,
    sharingSelected,
    isNarrow,
    isAllFilter,
    loading,
    onFetchAll: () => fetchPhotos(n, "all", "", "", 0, randomness),
    onLoadMore: () => fetchPhotos(n, filter, startDate, endDate, pageOffset + n, randomness, true),
    showMasonryCols: photos.length > 3 || pinterestMode,
    masonryCols,
    onDecrementMasonryCols: () => updateMasonryCols(masonryCols - 1),
    onIncrementMasonryCols: () => updateMasonryCols(masonryCols + 1),
    pinterestMode,
    onTogglePinterestMode: () => setPinterestMode((v) => !v),
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 ${
        light ? "bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-gray-900" : "bg-black text-white"
      }`}
    >
      <div className={`pointer-events-none fixed -top-1/2 -left-1/2 h-[200%] w-[200%] animate-spin-slow ${light ? "opacity-10" : "opacity-20"}`}>
        <div className={`absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl ${accentGradientClass(light)}`}></div>
      </div>

      <div
        className={`relative z-10 shrink-0 border-b-2 px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 ${
          light ? "border-blue-200/50" : "border-pink-300/15"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 sm:gap-3">
          {isNarrow ? (
            <LifeTimeRandomHeaderMobile
              {...headerControlsProps}
              onClose={onClose}
              onToggleLight={() => setLight((v) => !v)}
              sidebarOpen={sidebarOpen}
              onCloseSidebar={() => setSidebarOpen(false)}
            />
          ) : (
            <LifeTimeRandomHeaderDesktop
              {...headerControlsProps}
              onClose={onClose}
              onToggleLight={() => setLight((v) => !v)}
            />
          )}
        </div>
      </div>

      <div
        className={`relative z-10 flex-1 overflow-y-auto px-3 sm:px-4 sm:py-4 ${showSingle ? "flex flex-col justify-center" : ""}`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 sm:gap-3">
          <LifeTimeRandomSlides
            ref={slidesRef}
            photos={photos}
            batch={batch}
            currentIndex={currentIndex}
            light={light}
            loading={loading}
            isNarrow={isNarrow}
            showSingle={showSingle}
            pinterestMode={pinterestMode}
            selectedPhoto={selectedPhoto}
            setSelectedPhoto={(photo) => (photo === null ? closePhotoDetail() : setSelectedPhoto(photo))}
            onPhotoTap={handlePhotoTap}
            onRotatePhoto={rotatePhoto}
            goPrev={goPrev}
            goNext={goNext}
            onMaxViewPrev={() => goToAdjacentPhoto(-1)}
            onMaxViewNext={() => goToAdjacentPhoto(1)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            cardDragStyle={cardDragStyle}
            likeOpacity={likeOpacity}
            dislikeOpacity={dislikeOpacity}
            selectedIds={selectedIds}
            onToggleSelectPhoto={toggleSelectPhoto}
            masonryCols={masonryCols}
          />
        </div>
      </div>

      {isNarrow && (
        <LifeTimeRandomMobileBottomNav
          light={light}
          selectedCount={selectedIds.size}
          totalCount={photos.length}
          onSelectAll={selectAllPhotos}
          pinterestMode={pinterestMode}
          onTogglePinterestMode={() => setPinterestMode((v) => !v)}
          isAllFilter={isAllFilter}
          loading={loading}
          onFetchAll={() => fetchPhotos(n, "all", "", "", 0, randomness)}
          onLoadMore={() => fetchPhotos(n, filter, startDate, endDate, pageOffset + n, randomness, true)}
          slideshow={slideshow}
          paused={paused}
          onToggleSlideshow={() => {
            if (slideshow && paused) {
              setPaused(false);
            } else {
              setSlideshow((v) => !v);
              setPaused(false);
            }
          }}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      )}

      {showBackHint && (
        <div
          className={`pointer-events-none fixed inset-x-0 z-[70] flex justify-center px-4 ${
            isNarrow ? "bottom-28" : "bottom-6"
          }`}
        >
          <div
            className={`rounded-full border-2 px-4 py-2 text-sm shadow-2xl backdrop-blur-sm ${
              light ? "border-blue-300/60 bg-white/90 text-gray-700" : "border-pink-300/40 bg-black/80 text-white"
            }`}
          >
            Tap back again to exit
          </div>
        </div>
      )}

      {isNarrow && !showSingle && (pinterestMode || photos.length > 3) && photos.length > 0 && (
        <div className="fixed right-8 bottom-30 z-20">
          {screenshotMenuOpen && (
            <>
              <button
                onClick={() => handleScreenshotCapture("share")}
                aria-label="Share screenshot"
                style={{ transform: "translate(-30px, -52px)" }}
                className={`absolute inset-0 flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-sm cursor-pointer transition-transform active:scale-95 ${
                  light ? "border-blue-300/60 bg-white/95 text-gray-700" : "border-pink-300/50 bg-black/90 text-white"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                </svg>
              </button>
              <button
                onClick={() => handleScreenshotCapture("download")}
                aria-label="Download screenshot"
                style={{ transform: "translate(30px, -52px)" }}
                className={`absolute inset-0 flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-sm cursor-pointer transition-transform active:scale-95 ${
                  light ? "border-blue-300/60 bg-white/95 text-gray-700" : "border-pink-300/50 bg-black/90 text-white"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
                  <path d="M4 19h16" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => (screenshotCapturing ? undefined : setScreenshotMenuOpen((v) => !v))}
            disabled={screenshotCapturing}
            aria-label={screenshotMenuOpen ? "Close screenshot options" : "Screenshot collage"}
            aria-expanded={screenshotMenuOpen}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-sm transition-transform disabled:opacity-60 cursor-pointer active:scale-95 ${
              light ? "border-blue-300/60 bg-white/90 text-gray-700" : "border-pink-300/50 bg-black/80 text-white"
            }`}
          >
            {screenshotCapturing ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 animate-spin">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : screenshotMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </button>
        </div>
      )}

      {isNarrow && (photos.length > 3 || pinterestMode) && (
        <div
          className={`fixed left-1/2 bottom-30 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border-2 px-2 py-2 shadow-lg backdrop-blur-sm ${
            light ? "border-blue-300/60 bg-white/90 text-gray-700" : "border-pink-300/50 bg-black/80 text-white"
          }`}
        >
          <button
            onClick={() => updateMasonryCols(masonryCols - 1)}
            disabled={masonryCols <= MIN_MASONRY_COLS}
            aria-label="Fewer columns"
            className="flex h-7 w-7 items-center justify-center rounded-full text-base font-semibold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="w-4 text-center text-xs font-semibold tabular-nums">{masonryCols}</span>
          <button
            onClick={() => updateMasonryCols(masonryCols + 1)}
            disabled={masonryCols >= MAX_MASONRY_COLS}
            aria-label="More columns"
            className="flex h-7 w-7 items-center justify-center rounded-full text-base font-semibold disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      )}

      {error && (
        <div
          className={`pointer-events-none fixed inset-x-0 z-[70] flex justify-center px-4 ${
            isNarrow ? "bottom-28" : "bottom-6"
          }`}
        >
          <div
            className={`pointer-events-auto flex items-center gap-3 rounded-full border-2 px-5 py-3 text-sm shadow-2xl backdrop-blur-sm ${
              light
                ? "border-blue-300/60 bg-white/90 text-gray-700"
                : "border-pink-300/40 bg-black/80 text-white"
            }`}
          >
            <span>{error}</span>
            <button
              onClick={() => {
                const p = lastFetchParamsRef.current;
                if (p) fetchPhotos(p.count, p.filterValue, p.start, p.end, p.offset, p.randomnessValue);
              }}
              className={`shrink-0 rounded-full px-3 py-1 font-medium text-white cursor-pointer ${accentGradientClass(light)}`}
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
