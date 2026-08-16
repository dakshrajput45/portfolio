"use client";

import { useState } from "react";

export const MIN_N = 1;
export const MAX_N = 9;
export const DEFAULT_N = 3;
export const MIN_MASONRY_COLS = 2;
export const MAX_MASONRY_COLS = 6;

export type FilterValue = "all" | "week" | "month" | "newest" | "custom";

export const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "newest", label: "Newest" },
  { value: "custom", label: "Custom" },
];

export const MIN_RANDOMNESS = 0;
export const MAX_RANDOMNESS = 100;
export const RANDOMNESS_STEP = 25;

export function accentGradientClass(light: boolean) {
  return light ? "bg-gradient-to-r from-sky-400 to-blue-500" : "bg-gradient-to-r from-pink-400 to-purple-400";
}

export function accentShadowClass(light: boolean, opacity: 30 | 40 = 30) {
  if (opacity === 40) {
    return light ? "shadow-blue-400/40" : "shadow-pink-400/40";
  }
  return light ? "shadow-blue-400/30" : "shadow-pink-400/30";
}

export interface HeaderControlsProps {
  light: boolean;
  slideshow: boolean;
  paused: boolean;
  onToggleSlideshow: () => void;
  onTogglePause: () => void;
  n: number;
  nInput: string;
  onDecrement: () => void;
  onIncrement: () => void;
  onNInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNInputBlur: () => void;
  filter: FilterValue;
  onFilterChange: (value: FilterValue) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  randomness: number;
  onRandomnessChange: (value: number) => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onShareSelected: () => void;
  sharingSelected: boolean;
  isNarrow: boolean;
  isAllFilter: boolean;
  loading: boolean;
  onFetchAll: () => void;
  onLoadMore: () => void;
  showMasonryCols: boolean;
  masonryCols: number;
  onDecrementMasonryCols: () => void;
  onIncrementMasonryCols: () => void;
  pinterestMode: boolean;
  onTogglePinterestMode: () => void;
}

export function HeartLoadMoreButton({
  onClick,
  loading,
  light,
}: {
  onClick: () => void;
  loading: boolean;
  light: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      aria-label="Load more photos"
      className={`flex h-9 sm:h-11 items-center justify-center rounded-full border-2 px-3 sm:px-4 text-base sm:text-lg backdrop-blur-sm transition-colors disabled:opacity-50 cursor-pointer animate-pulse-slow ${
        light ? "border-blue-300/60 bg-white/70 hover:border-blue-400 hover:bg-blue-100": "border-pink-300/50 bg-black/50 hover:border-pink-300/90 hover:bg-pink-300/10"
      }`}
    >
      {loading ? "…" : "💖"}
    </button>
  );
}

export function InfoTooltip({ text, light }: { text: string; light: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        aria-label="What does this do?"
        className={
          light
            ? "flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 text-[10px] text-gray-500 cursor-pointer"
            : "flex h-4 w-4 items-center justify-center rounded-full border border-white/40 text-[10px] text-white/60 cursor-pointer"
        }
      >
        i
      </button>
      {open && (
        <div
          className={`absolute bottom-full left-1/2 z-30 mb-2 w-48 -translate-x-1/2 rounded-xl border-2 px-3 py-2 text-xs shadow-xl ${
            light ? "border-blue-300/50 bg-white text-gray-700": "border-pink-300/40 bg-black/90 text-white"
          }`}
        >
          {text}
        </div>
      )}
    </span>
  );
}

export function DarkModeIcon({ light }: { light: boolean }) {
  return light ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function BackButton({ onClick, light }: { onClick: () => void; light: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label="Back"
      className={
        light
          ? "absolute top-2 left-2 sm:top-6 sm:left-6 z-10 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-blue-300/60 bg-white/70 text-gray-700 backdrop-blur-sm transition-colors hover:border-blue-400 hover:bg-blue-100 cursor-pointer"
          : "absolute top-2 left-2 sm:top-6 sm:left-6 z-10 flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
      }
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

export function buildHeaderControls(props: HeaderControlsProps) {
  const {
    light,
    slideshow,
    paused,
    onToggleSlideshow,
    onTogglePause,
    n,
    nInput,
    onDecrement,
    onIncrement,
    onNInputChange,
    onNInputBlur,
    filter,
    onFilterChange,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    randomness,
    onRandomnessChange,
    selectedCount,
    totalCount,
    onSelectAll,
    onShareSelected,
    sharingSelected,
    isNarrow,
    isAllFilter,
    loading,
    onFetchAll,
    onLoadMore,
    showMasonryCols,
    masonryCols,
    onDecrementMasonryCols,
    onIncrementMasonryCols,
    pinterestMode,
    onTogglePinterestMode,
  } = props;

  const actionButtons = (
    <>
      {totalCount > 0 && (
        <button
          onClick={onSelectAll}
          className={
            light ? "flex h-9 sm:h-11 items-center rounded-full border-2 border-blue-300/60 bg-white/70 px-3 sm:px-4 text-xs sm:text-sm font-medium text-gray-700 backdrop-blur-sm transition-colors hover:border-blue-400 hover:bg-blue-100 cursor-pointer": "flex h-9 sm:h-11 items-center rounded-full border-2 border-pink-300/50 bg-black/50 px-3 sm:px-4 text-xs sm:text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
          }
        >
          {selectedCount === totalCount ? "Deselect all" : "Select all"}
        </button>
      )}

      {selectedCount > 0 && (
        <button
          onClick={onShareSelected}
          disabled={sharingSelected}
          className={`flex h-9 sm:h-11 items-center gap-1.5 rounded-full border-2 border-transparent px-4 sm:px-5 text-xs sm:text-sm font-medium text-white shadow-md backdrop-blur-sm transition-colors disabled:opacity-60 cursor-pointer ${accentGradientClass(light)} ${accentShadowClass(light)}`}
        >
          {sharingSelected ? "Sharing…" : `Share (${selectedCount})`}
        </button>
      )}

      <button
        onClick={onTogglePinterestMode}
        aria-label={
          pinterestMode
            ? "Switch to single-photo view"
            : isNarrow
              ? "Switch to Pinterest view"
              : "Switch to Pinterest layout"
        }
        className={`flex h-9 sm:h-11 items-center gap-1.5 rounded-full border-2 px-3 sm:px-4 text-xs sm:text-sm font-medium backdrop-blur-sm transition-colors cursor-pointer ${
          pinterestMode
            ? `border-transparent text-white shadow-md ${accentGradientClass(light)} ${accentShadowClass(light)}`
            : light ? "border-blue-300/60 bg-white/70 text-gray-700 hover:border-blue-400 hover:bg-blue-100": "border-pink-300/50 bg-black/50 text-white hover:border-pink-300/90 hover:bg-pink-300/10"
        }`}
      >
        Pinterest
      </button>
    </>
  );

  const loadMoreButton = (
    <HeartLoadMoreButton onClick={isAllFilter ? onFetchAll : onLoadMore} loading={loading} light={light} />
  );

  const slideshowControls = (
    <>
      <button
        onClick={onToggleSlideshow}
        aria-label={slideshow ? "Stop slideshow" : "Start slideshow"}
        className={`flex h-9 sm:h-11 items-center gap-1.5 rounded-full border-2 px-3 sm:px-4 text-xs sm:text-sm font-medium backdrop-blur-sm transition-colors cursor-pointer ${
          slideshow
            ? `border-transparent text-white shadow-md ${accentGradientClass(light)} ${accentShadowClass(light)}`
            : light ? "border-blue-300/60 bg-white/70 text-gray-700 hover:border-blue-400 hover:bg-blue-100": "border-pink-300/50 bg-black/50 text-white hover:border-pink-300/90 hover:bg-pink-300/10"
        }`}
      >
        {slideshow ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        Slideshow
      </button>

      {slideshow && (
        <>
          <button
            onClick={onTogglePause}
            aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
            className={
              light ? "flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-blue-300/60 bg-white/70 text-gray-700 backdrop-blur-sm transition-colors hover:border-blue-400 hover:bg-blue-100 cursor-pointer": "flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
            }
          >
            {paused ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            )}
          </button>
        </>
      )}
    </>
  );

  const fineTuneControls = (
    <>
      <div
        className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 ${
          light ? "border-blue-200/50 bg-white/70": "border-pink-300/30 bg-black/30"
        }`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            light ? "bg-blue-100 text-pink-500": "bg-pink-300/20 text-pink-300"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </span>
        <span className={`flex-1 text-sm ${light ? "text-gray-600" : "text-white/70"}`}>Photos to show</span>
        <div
          className={`flex items-center gap-1 rounded-full border-2 p-1 ${
            light ? "border-blue-200/50 bg-white/60": "border-pink-300/30 bg-black/20"
          }`}
        >
          <button
            onClick={onDecrement}
            aria-label="Fewer photos"
            disabled={n <= MIN_N}
            className={
              light ? "flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-blue-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed": "flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-pink-300/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            }
          >
            −
          </button>
          <input
            id="photo-count"
            type="text"
            inputMode="numeric"
            value={nInput}
            onChange={onNInputChange}
            onBlur={onNInputBlur}
            className={`w-8 bg-transparent text-center text-base font-semibold outline-none ${
              light ? "text-gray-900" : "text-white"
            }`}
          />
          <button
            onClick={onIncrement}
            aria-label="More photos"
            disabled={n >= MAX_N}
            className={
              light ? "flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-blue-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed": "flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-pink-300/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            }
          >
            +
          </button>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 ${
          light ? "border-blue-200/50 bg-white/70": "border-pink-300/30 bg-black/30"
        }`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            light ? "bg-blue-100 text-pink-500": "bg-pink-300/20 text-pink-300"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M4 4h16l-6 8v6l-4 2v-8L4 4z" />
          </svg>
        </span>
        <span className={`text-sm ${light ? "text-gray-600" : "text-white/70"}`}>Show</span>
        <div className="flex flex-1 flex-wrap justify-end gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`rounded-full border-2 px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                filter === f.value
                  ? `border-transparent text-white ${accentGradientClass(light)}`
                  : light ? "border-blue-200/50 bg-white/60 text-gray-700 hover:bg-blue-100": "border-pink-300/30 bg-black/20 text-white hover:bg-pink-300/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {showMasonryCols && (
        <div
          className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 ${
            light ? "border-blue-200/50 bg-white/70": "border-pink-300/30 bg-black/30"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              light ? "bg-blue-100 text-pink-500": "bg-pink-300/20 text-pink-300"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </span>
          <span className={`flex-1 text-sm ${light ? "text-gray-600" : "text-white/70"}`}>Columns</span>
          <div
            className={`flex items-center gap-1 rounded-full border-2 p-1 ${
              light ? "border-blue-200/50 bg-white/60": "border-pink-300/30 bg-black/20"
            }`}
          >
            <button
              onClick={onDecrementMasonryCols}
              aria-label="Fewer columns (bigger photos)"
              disabled={masonryCols <= MIN_MASONRY_COLS}
              className={
                light ? "flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-blue-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed": "flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-pink-300/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              }
            >
              −
            </button>
            <span className={`w-4 text-center text-base font-semibold ${light ? "text-gray-900" : "text-white"}`}>
              {masonryCols}
            </span>
            <button
              onClick={onIncrementMasonryCols}
              aria-label="More columns (smaller photos)"
              disabled={masonryCols >= MAX_MASONRY_COLS}
              className={
                light ? "flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-blue-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed": "flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-pink-300/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              }
            >
              +
            </button>
          </div>
        </div>
      )}

      {filter === "all" && (
        <div
          className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 ${
            light ? "border-blue-200/50 bg-white/70": "border-pink-300/30 bg-black/30"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              light ? "bg-blue-100 text-pink-500": "bg-pink-300/20 text-pink-300"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M17 3l4 4-4 4M3 17l4 4 4-4M3 7h4l10 10h4M3 17h4l10-10h4" />
            </svg>
          </span>
          <span className={`flex-1 text-sm ${light ? "text-gray-600" : "text-white/70"}`}>Randomness</span>
          <InfoTooltip
            light={light}
            text="Spreads each batch across different points in your whole photo history instead of pure luck-of-the-draw — higher means less chance of getting several photos from the same day, more variety to jog different memories."
          />
          <div
            className={`flex items-center gap-1 rounded-full border-2 p-1 ${
              light ? "border-blue-200/50 bg-white/60": "border-pink-300/30 bg-black/20"
            }`}
          >
            <button
              onClick={() => onRandomnessChange(Math.max(MIN_RANDOMNESS, randomness - RANDOMNESS_STEP))}
              aria-label="Less randomness"
              disabled={randomness <= MIN_RANDOMNESS}
              className={
                light ? "flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-blue-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed": "flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-pink-300/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              }
            >
              −
            </button>
            <span className={`w-9 text-center text-sm font-semibold ${light ? "text-gray-900" : "text-white"}`}>
              {randomness}%
            </span>
            <button
              onClick={() => onRandomnessChange(Math.min(MAX_RANDOMNESS, randomness + RANDOMNESS_STEP))}
              aria-label="More randomness"
              disabled={randomness >= MAX_RANDOMNESS}
              className={
                light ? "flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-blue-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed": "flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-pink-300/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              }
            >
              +
            </button>
          </div>
        </div>
      )}
    </>
  );

  const dateRangeRow = filter === "custom" && (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        aria-label="Start date"
        className={
          light ? "rounded-full border-2 border-blue-200/50 bg-white/70 px-3 py-1 text-xs sm:text-sm text-gray-900": "rounded-full border-2 border-pink-300/30 bg-black/30 px-3 py-1 text-xs sm:text-sm text-white [color-scheme:dark]"
        }
      />
      <span className={light ? "text-xs text-gray-500" : "text-xs text-white/50"}>to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        aria-label="End date"
        className={
          light ? "rounded-full border-2 border-blue-200/50 bg-white/70 px-3 py-1 text-xs sm:text-sm text-gray-900": "rounded-full border-2 border-pink-300/30 bg-black/30 px-3 py-1 text-xs sm:text-sm text-white [color-scheme:dark]"
        }
      />
    </div>
  );

  return { actionButtons, loadMoreButton, slideshowControls, fineTuneControls, dateRangeRow };
}
