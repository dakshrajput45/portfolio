"use client";

import {
  BackButton,
  buildHeaderControls,
  cornerButtonClass,
  DarkModeIcon,
  HeaderControlsProps,
} from "./LifeTimeRandomHeaderShared";

interface LifeTimeRandomHeaderDesktopProps extends HeaderControlsProps {
  onClose: () => void;
  onToggleLight: () => void;
}

export default function LifeTimeRandomHeaderDesktop(props: LifeTimeRandomHeaderDesktopProps) {
  const { light, onClose, onToggleLight } = props;
  const { actionButtons, loadMoreButton, slideshowControls, fineTuneControls, columnsControl, dateRangeRow } =
    buildHeaderControls(props);

  return (
    <>
      <BackButton onClick={onClose} light={light} />

      <button
        onClick={onToggleLight}
        aria-label={light ? "Switch to dark mode" : "Switch to bright mode"}
        className={`absolute top-2 right-2 sm:top-6 sm:right-6 ${cornerButtonClass(light)}`}
      >
        <DarkModeIcon light={light} />
      </button>

      <h1 className="shrink-0 font-sans text-2xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text">
        See More Of Us
      </h1>
      <p className={`shrink-0 text-center text-xs sm:text-sm ${light ? "text-gray-500" : "text-white/60"}`}>
        Straight from our shared Drive folder — if something&apos;s missing, ask your baby to sync it 💕
      </p>

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:gap-3">
        {actionButtons}
        {slideshowControls}
        {loadMoreButton}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 sm:gap-4">
        {fineTuneControls}
        {columnsControl}
      </div>
      {dateRangeRow}
    </>
  );
}
