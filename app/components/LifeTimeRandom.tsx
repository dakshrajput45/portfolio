"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MIN_N = 1;
const MAX_N = 9;
const DEFAULT_N = 3;
const SWIPE_THRESHOLD = 50;

const FILTERS: { value: "all" | "week" | "month" | "newest" | "custom"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "newest", label: "Newest" },
  { value: "custom", label: "Custom" },
];

interface Photo {
  id: string;
  name: string;
  src: string;
  isVideo: boolean;
  rotation: number;
}

function RotatablePhoto({
  photo,
  className,
  muted = true,
  controls = false,
}: {
  photo: Photo;
  className: string;
  muted?: boolean;
  controls?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = photo.src;
  const upright = photo.rotation % 180 === 0;
  const handleLoad = () => setLoaded(true);

  const loader = !loaded && (
    <div className="absolute inset-0 z-10 flex items-center justify-center gap-2">
      <span className="h-2 w-2 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0s" }}></span>
      <span className="h-2 w-2 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.2s" }}></span>
      <span className="h-2 w-2 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.4s" }}></span>
    </div>
  );

  if (upright) {
    const style = {
      ...(photo.rotation ? { transform: `rotate(${photo.rotation}deg)` } : {}),
      opacity: loaded ? 1 : 0,
      transition: "opacity 0.3s ease",
    };
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        {photo.isVideo ? (
          <video src={src} autoPlay muted={muted} controls={controls} loop playsInline className={className} style={style} onLoadedData={handleLoad} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={photo.name} className={className} style={style} onLoad={handleLoad} />
        )}
        {loader}
      </div>
    );
  }

  const rotatedStyle = {
    width: "100cqh",
    height: "100cqw",
    transform: `translate(-50%, -50%) rotate(${photo.rotation}deg)`,
    opacity: loaded ? 1 : 0,
    transition: "opacity 0.3s ease",
  } as const;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ containerType: "size" }}>
      {photo.isVideo ? (
        <video
          src={src}
          autoPlay
          muted={muted}
          controls={controls}
          loop
          playsInline
          className={`absolute top-1/2 left-1/2 object-contain ${className}`}
          style={rotatedStyle}
          onLoadedData={handleLoad}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={photo.name}
          className={`absolute top-1/2 left-1/2 object-contain ${className}`}
          style={rotatedStyle}
          onLoad={handleLoad}
        />
      )}
      {loader}
    </div>
  );
}

function IconButton({
  onClick,
  label,
  light,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  light: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={label}
      className={
        light
          ? "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-pink-400/60 bg-white/70 text-gray-700 backdrop-blur-sm transition-colors hover:border-pink-400 hover:bg-pink-100 cursor-pointer"
          : "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
      }
    >
      {children}
    </button>
  );
}

function PhotoTile({
  photo,
  light,
  onRotate,
  onShare,
  onSelect,
  className = "",
  style,
}: {
  photo: Photo;
  light: boolean;
  onRotate: () => void;
  onShare: () => void;
  onSelect: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group relative min-h-0 min-w-0 cursor-pointer overflow-hidden rounded-3xl shadow-2xl shadow-black/50 ${
        light ? "bg-white" : "bg-black"
      } ${className}`}
      style={style}
    >
      <RotatablePhoto photo={photo} className="h-full w-full object-contain" />

      <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 flex gap-1.5 sm:gap-2">
        <IconButton onClick={onRotate} label="Rotate photo clockwise" light={light}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5">
            <path d="M21 12a9 9 0 1 1-3.2-6.9" />
            <path d="M21 3v6h-6" />
          </svg>
        </IconButton>
        <IconButton onClick={onShare} label="Share photo" light={light}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}

function PhotoMaxView({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-2 sm:p-4"
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative flex items-center justify-center"
        style={{ height: "92vh", width: "96vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        <RotatablePhoto
          photo={photo}
          className="max-h-full max-w-full object-contain"
          muted={false}
          controls={photo.isVideo}
        />
      </div>
    </div>,
    document.body
  );
}

async function sharePhoto(photo: Photo) {
  try {
    const res = await fetch(photo.src);
    const blob = await res.blob();
    const file = new File([blob], photo.name, { type: blob.type });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return;
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    console.error("Share failed:", err);
  }
  window.open(photo.src, "_blank");
}

export default function LifeTimeRandom({ onClose }: { onClose: () => void }) {
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
  const [filter, setFilter] = useState<"all" | "week" | "month" | "newest" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fetchPhotos = useCallback(
    async (count: number, filterValue: string, start: string, end: string) => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ n: String(count) });
        if (start || end) {
          if (start) qs.set("startDate", start);
          if (end) qs.set("endDate", end);
        } else {
          qs.set("filter", filterValue);
        }
        const res = await fetch(`/api/random-photos?${qs}`);
        if (!res.ok) throw new Error("Failed to load photos");
        const data = await res.json();
        setPhotos(
          (data.photos as Omit<Photo, "rotation">[]).map((p) => ({ ...p, rotation: 0 }))
        );
        setCurrentIndex(0);
        setBatch((b) => b + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPhotos(DEFAULT_N, "all", "", "");
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

  const goPrev = () => setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  const goNext = () => {
    if (currentIndex >= photos.length - 1) {
      fetchPhotos(n, filter, startDate, endDate);
    } else {
      setCurrentIndex((i) => i + 1);
    }
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

  const rawCols = Math.ceil(Math.sqrt(photos.length || 1));
  const cols = isNarrow ? Math.min(rawCols, 2) : photos.length > 0 && photos.length <= 3 ? photos.length : rawCols;
  const rows = Math.ceil((photos.length || 1) / cols);
  const currentPhoto = photos[currentIndex];

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden px-3 py-3 sm:px-4 sm:py-4 transition-colors duration-300 ${
        light ? "bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-gray-900" : "bg-black text-white"
      }`}
    >
      <div className={`absolute -top-1/2 -left-1/2 h-[200%] w-[200%] animate-spin-slow ${light ? "opacity-10" : "opacity-20"}`}>
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 blur-3xl"></div>
      </div>

      <button
        onClick={onClose}
        aria-label="Back"
        className={
          light
            ? "absolute top-3 left-3 sm:top-6 sm:left-6 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-pink-400/60 bg-white/70 text-gray-700 backdrop-blur-sm transition-colors hover:border-pink-400 hover:bg-pink-100 cursor-pointer"
            : "absolute top-3 left-3 sm:top-6 sm:left-6 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
        }
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={() => setLight((v) => !v)}
        aria-label={light ? "Switch to dark mode" : "Switch to bright mode"}
        className={
          light
            ? "absolute top-3 right-3 sm:top-6 sm:right-6 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-pink-400/60 bg-white/70 text-gray-700 backdrop-blur-sm transition-colors hover:border-pink-400 hover:bg-pink-100 cursor-pointer"
            : "absolute top-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
        }
      >
        {light ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        )}
      </button>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-center gap-3">
        <h1 className="shrink-0 font-sans text-2xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text">
          See More Of Us
        </h1>
        <p className={`shrink-0 text-center text-xs sm:text-sm ${light ? "text-gray-500" : "text-white/60"}`}>
          Straight from our shared Drive folder — if something&apos;s missing, ask your baby to sync it 💕
        </p>

        <div className="flex shrink-0 items-center gap-3">
          <span className={light ? "text-sm text-gray-600" : "text-sm text-white/70"}>Photos to show</span>
          <div
            className={`flex items-center gap-1 rounded-full border-2 p-1 ${
              light ? "border-pink-300/40 bg-white/70" : "border-pink-300/30 bg-black/30"
            }`}
          >
            <button
              onClick={() => updateN(n - 1)}
              aria-label="Fewer photos"
              disabled={n <= MIN_N}
              className={
                light
                  ? "flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-pink-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  : "flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-pink-300/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              }
            >
              −
            </button>
            <input
              id="photo-count"
              type="text"
              inputMode="numeric"
              value={nInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setNInput(raw);
                const parsed = Number(raw);
                if (raw !== "" && Number.isFinite(parsed)) {
                  setN(Math.min(MAX_N, Math.max(MIN_N, parsed)));
                }
              }}
              onBlur={() => {
                const parsed = Number(nInput);
                const clamped =
                  nInput !== "" && Number.isFinite(parsed)
                    ? Math.min(MAX_N, Math.max(MIN_N, parsed))
                    : DEFAULT_N;
                setN(clamped);
                setNInput(String(clamped));
              }}
              className={`w-8 bg-transparent text-center text-base font-semibold outline-none ${
                light ? "text-gray-900" : "text-white"
              }`}
            />
            <button
              onClick={() => updateN(n + 1)}
              aria-label="More photos"
              disabled={n >= MAX_N}
              className={
                light
                  ? "flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-pink-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  : "flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-pink-300/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              }
            >
              +
            </button>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full border-2 px-3.5 py-1 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  filter === f.value
                    ? "border-transparent bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md shadow-pink-400/30"
                    : light
                      ? "border-gray-300/70 bg-white/60 text-gray-600 hover:border-pink-300 hover:bg-pink-50"
                      : "border-white/20 bg-white/5 text-white/70 hover:border-pink-300/50 hover:bg-pink-300/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filter === "custom" && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Start date"
                className={
                  light
                    ? "rounded-full border-2 border-pink-300/40 bg-white/70 px-3 py-1 text-xs sm:text-sm text-gray-900"
                    : "rounded-full border-2 border-pink-300/30 bg-black/30 px-3 py-1 text-xs sm:text-sm text-white [color-scheme:dark]"
                }
              />
              <span className={light ? "text-xs text-gray-500" : "text-xs text-white/50"}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="End date"
                className={
                  light
                    ? "rounded-full border-2 border-pink-300/40 bg-white/70 px-3 py-1 text-xs sm:text-sm text-gray-900"
                    : "rounded-full border-2 border-pink-300/30 bg-black/30 px-3 py-1 text-xs sm:text-sm text-white [color-scheme:dark]"
                }
              />
            </div>
          )}
        </div>

        {error && <p className="shrink-0 text-red-400">{error}</p>}

        <div className="relative min-h-0 w-full flex-1">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0s" }}></span>
              <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.2s" }}></span>
              <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.4s" }}></span>
            </div>
          )}

          {isNarrow ? (
            <div
              className={`relative flex h-full w-full items-center justify-center transition-opacity duration-300 ${loading ? "opacity-30" : "opacity-100"}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {currentPhoto && (
                <PhotoTile
                  key={`${batch}-${currentPhoto.id}`}
                  photo={currentPhoto}
                  light={light}
                  onRotate={() => rotatePhoto(currentPhoto.id)}
                  onShare={() => sharePhoto(currentPhoto)}
                  onSelect={() => setSelectedPhoto(currentPhoto)}
                  className="h-[82%] w-[82%] animate-zoom-out-in"
                  style={cardDragStyle}
                />
              )}

              {likeOpacity > 0 && (
                <div
                  className="pointer-events-none absolute top-6 left-6 z-20 -rotate-12 text-6xl drop-shadow-lg"
                  style={{ opacity: likeOpacity, transform: `scale(${0.7 + likeOpacity * 0.3})` }}
                >
                  😍
                </div>
              )}
              {dislikeOpacity > 0 && (
                <div
                  className="pointer-events-none absolute top-6 right-6 z-20 rotate-12 text-6xl drop-shadow-lg"
                  style={{ opacity: dislikeOpacity, transform: `scale(${0.7 + dislikeOpacity * 0.3})` }}
                >
                  😢
                </div>
              )}

              {photos.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    aria-label="Previous photo"
                    className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/40 text-white backdrop-blur-sm cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Next photo"
                    className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/40 text-white backdrop-blur-sm cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                  <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                    {photos.map((p, idx) => (
                      <span
                        key={p.id}
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          idx === currentIndex ? "bg-pink-400" : light ? "bg-gray-300" : "bg-white/30"
                        }`}
                      ></span>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              className={`grid h-full w-full gap-2 sm:gap-3 transition-opacity duration-300 ${loading ? "opacity-30" : "opacity-100"}`}
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              }}
            >
              {photos.map((photo, i) => (
                <PhotoTile
                  key={`${batch}-${photo.id}`}
                  photo={photo}
                  light={light}
                  onRotate={() => rotatePhoto(photo.id)}
                  onShare={() => sharePhoto(photo)}
                  onSelect={() => setSelectedPhoto(photo)}
                  className="animate-zoom-out-in"
                  style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "backwards" }}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => fetchPhotos(n, filter, startDate, endDate)}
          disabled={loading}
          aria-label="Fetch more photos"
          className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border-2 text-xl sm:text-2xl backdrop-blur-sm transition-colors disabled:opacity-50 cursor-pointer animate-pulse-slow ${
            light
              ? "border-pink-400/60 bg-white/70 hover:border-pink-400 hover:bg-pink-100"
              : "border-pink-300/50 bg-black/50 hover:border-pink-300/90 hover:bg-pink-300/10"
          }`}
        >
          {loading ? "…" : "💖"}
        </button>
      </div>

      {selectedPhoto && (
        <PhotoMaxView photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>,
    document.body
  );
}
