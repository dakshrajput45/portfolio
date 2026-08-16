"use client";

import { buildHeaderControls, DarkModeIcon, HeaderControlsProps } from "./LifeTimeRandomHeaderShared";

interface LifeTimeRandomSidebarDesktopProps extends HeaderControlsProps {
  open: boolean;
  onToggleLight: () => void;
  showScreenshot: boolean;
  screenshotCapturing: boolean;
  onCaptureScreenshot: (mode: "share" | "download") => void;
}

export default function LifeTimeRandomSidebarDesktop(props: LifeTimeRandomSidebarDesktopProps) {
  const { light, open, onToggleLight, showScreenshot, screenshotCapturing, onCaptureScreenshot, slideshow, paused, onTogglePause } =
    props;
  const { fineTuneControls, columnsControl, dateRangeRow } = buildHeaderControls(props);

  if (!open) return null;

  const controlButtonClass = light
    ? "border-blue-300/60 bg-white/70 text-gray-700 hover:bg-blue-100"
    : "border-pink-300/50 bg-black/50 text-white hover:bg-pink-300/10";

  return (
    <aside
      className={`flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l-2 px-4 py-4 ${
        light ? "border-blue-200/50" : "border-pink-300/15"
      }`}
    >
      <button
        onClick={onToggleLight}
        className={`flex items-center justify-between rounded-full border-2 px-4 py-2.5 text-sm font-medium cursor-pointer ${controlButtonClass}`}
      >
        {light ? "Switch to dark mode" : "Switch to bright mode"}
        <DarkModeIcon light={light} />
      </button>

      {showScreenshot && (
        <div
          className={`flex flex-col gap-2 rounded-2xl border-2 px-3 py-2 ${
            light ? "border-blue-200/50 bg-white/70" : "border-pink-300/30 bg-black/30"
          }`}
        >
          <span className={`text-sm ${light ? "text-gray-600" : "text-white/70"}`}>Screenshot</span>
          <div className="flex gap-2">
            <button
              onClick={() => onCaptureScreenshot("share")}
              disabled={screenshotCapturing}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${controlButtonClass}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
              Share
            </button>
            <button
              onClick={() => onCaptureScreenshot("download")}
              disabled={screenshotCapturing}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${controlButtonClass}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
                <path d="M4 19h16" />
              </svg>
              {screenshotCapturing ? "Capturing…" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {fineTuneControls}
        {columnsControl}
      </div>
      {dateRangeRow}
      {slideshow && (
        <button
          onClick={onTogglePause}
          className={`flex items-center justify-between gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-medium cursor-pointer ${controlButtonClass}`}
        >
          {paused ? "Resume slideshow" : "Pause slideshow"}
          {paused ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          )}
        </button>
      )}
    </aside>
  );
}
