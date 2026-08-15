export const MIN_N = 1;
export const MAX_N = 9;
export const DEFAULT_N = 3;

export type FilterValue = "all" | "week" | "month" | "newest" | "custom";

export const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "newest", label: "Newest" },
  { value: "custom", label: "Custom" },
];

interface LifeTimeRandomHeaderProps {
  light: boolean;
  onClose: () => void;
  onToggleLight: () => void;
  slideshow: boolean;
  paused: boolean;
  intervalSec: number;
  onToggleSlideshow: () => void;
  onTogglePause: () => void;
  onIntervalChange: (value: number) => void;
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
}

export default function LifeTimeRandomHeader({
  light,
  onClose,
  onToggleLight,
  slideshow,
  paused,
  intervalSec,
  onToggleSlideshow,
  onTogglePause,
  onIntervalChange,
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
}: LifeTimeRandomHeaderProps) {
  return (
    <>
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
        onClick={onToggleLight}
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

      <h1 className="shrink-0 font-sans text-2xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text">
        See More Of Us
      </h1>
      <p className={`shrink-0 text-center text-xs sm:text-sm ${light ? "text-gray-500" : "text-white/60"}`}>
        Straight from our shared Drive folder — if something&apos;s missing, ask your baby to sync it 💕
      </p>

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSlideshow}
          aria-label={slideshow ? "Stop slideshow" : "Start slideshow"}
          className={`flex h-9 sm:h-11 items-center gap-1.5 rounded-full border-2 px-3 sm:px-4 text-xs sm:text-sm font-medium backdrop-blur-sm transition-colors cursor-pointer ${
            slideshow
              ? "border-transparent bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md shadow-pink-400/30"
              : light
                ? "border-pink-400/60 bg-white/70 text-gray-700 hover:border-pink-400 hover:bg-pink-100"
                : "border-pink-300/50 bg-black/50 text-white hover:border-pink-300/90 hover:bg-pink-300/10"
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
                light
                  ? "flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-pink-400/60 bg-white/70 text-gray-700 backdrop-blur-sm transition-colors hover:border-pink-400 hover:bg-pink-100 cursor-pointer"
                  : "flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
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

            <div
              className={`flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 sm:px-3 ${
                light ? "border-pink-300/40 bg-white/70" : "border-pink-300/30 bg-black/30"
              }`}
            >
              <input
                type="range"
                min={2}
                max={30}
                value={intervalSec}
                onChange={(e) => onIntervalChange(Number(e.target.value))}
                aria-label="Slideshow speed in seconds"
                className="w-14 sm:w-20 cursor-pointer accent-pink-400"
              />
              <span className={`text-xs tabular-nums ${light ? "text-gray-600" : "text-white/70"}`}>{intervalSec}s</span>
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          <span className={light ? "text-sm text-gray-600" : "text-sm text-white/70"}>Photos to show</span>
          <div
            className={`flex items-center gap-1 rounded-full border-2 p-1 ${
              light ? "border-pink-300/40 bg-white/70" : "border-pink-300/30 bg-black/30"
            }`}
          >
            <button
              onClick={onDecrement}
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
                light
                  ? "flex h-7 w-7 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-pink-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  : "flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-pink-300/20 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              }
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap justify-center gap-2 sm:gap-2.5">
        {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
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
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
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
            onChange={(e) => onEndDateChange(e.target.value)}
            aria-label="End date"
            className={
              light
                ? "rounded-full border-2 border-pink-300/40 bg-white/70 px-3 py-1 text-xs sm:text-sm text-gray-900"
                : "rounded-full border-2 border-pink-300/30 bg-black/30 px-3 py-1 text-xs sm:text-sm text-white [color-scheme:dark]"
            }
          />
        </div>
      )}
    </>
  );
}
