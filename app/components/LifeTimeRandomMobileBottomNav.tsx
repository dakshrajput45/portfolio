"use client";

import { accentGradientClass, accentShadowClass } from "./LifeTimeRandomHeaderShared";

function NavIconButton({
  onClick,
  label,
  text,
  light,
  disabled = false,
  children,
}: {
  onClick: () => void;
  label: string;
  text: string;
  light: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`relative flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed ${
        light ? "text-gray-700 hover:bg-pink-100" : "text-white hover:bg-pink-300/10"
      }`}
    >
      {children}
      <span className="text-[10px] font-medium leading-none whitespace-nowrap">{text}</span>
    </button>
  );
}

interface LifeTimeRandomMobileBottomNavProps {
  light: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  pinterestMode: boolean;
  onTogglePinterestMode: () => void;
  isAllFilter: boolean;
  loading: boolean;
  onFetchAll: () => void;
  onLoadMore: () => void;
  slideshow: boolean;
  paused: boolean;
  onToggleSlideshow: () => void;
  onOpenSidebar: () => void;
}

export default function LifeTimeRandomMobileBottomNav({
  light,
  selectedCount,
  totalCount,
  onSelectAll,
  pinterestMode,
  onTogglePinterestMode,
  isAllFilter,
  loading,
  onFetchAll,
  onLoadMore,
  slideshow,
  paused,
  onToggleSlideshow,
  onOpenSidebar,
}: LifeTimeRandomMobileBottomNavProps) {
  const showPlayIcon = !slideshow || paused;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const barClass = light ? "border-blue-200 bg-white/90 text-gray-700" : "border-pink-300/30 bg-black/90 text-white";

  return (
    <div className="relative shrink-0">
      <div
        className={`relative z-20 flex items-center justify-around border-t-2 px-2 pt-1 backdrop-blur-md ${barClass}`}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
      >
        <NavIconButton
          onClick={onSelectAll}
          label={allSelected ? "Deselect all photos" : "Select all photos"}
          text={allSelected ? "Deselect" : "Select"}
          light={light}
          disabled={totalCount === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 12l3 3 7-7" />
          </svg>
          {selectedCount > 0 && (
            <span
              className={`absolute -top-0.5 right-3 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${accentGradientClass(light)}`}
            >
              {selectedCount}
            </span>
          )}
        </NavIconButton>

        <NavIconButton
          onClick={onTogglePinterestMode}
          label={pinterestMode ? "Switch to single-photo view" : "Switch to Pinterest view"}
          text={pinterestMode ? "Single" : "Pinterest"}
          light={light}
        >
          {pinterestMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          )}
        </NavIconButton>

        <div className="flex w-16 shrink-0 flex-col items-center gap-0.5">
          <button
            onClick={isAllFilter ? onFetchAll : onLoadMore}
            disabled={loading}
            aria-label="Load more photos"
            className={`-mt-10 flex h-[4rem] w-[4rem] items-center justify-center rounded-full border-4 border-white/80 text-3xl text-white shadow-lg backdrop-blur-sm transition-transform disabled:opacity-60 cursor-pointer active:scale-95 ${accentGradientClass(light)} ${accentShadowClass(light, 40)}`}
          >
            <span className="text-2xl">{loading ? "…" : "💖"}</span>
          </button>
          <span className={`text-[12px] mt-2 font-medium leading-none ${light ? "text-gray-700" : "text-white"}`}>
            More
          </span>
        </div>

        <NavIconButton
          onClick={onToggleSlideshow}
          label={!slideshow ? "Start slideshow" : paused ? "Resume slideshow" : "Stop slideshow"}
          text={!slideshow ? "Slideshow" : paused ? "Resume" : "Stop"}
          light={light}
        >
          {showPlayIcon ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          )}
        </NavIconButton>

        <NavIconButton onClick={onOpenSidebar} label="Menu" text="Menu" light={light}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </NavIconButton>
      </div>
    </div>
  );
}
