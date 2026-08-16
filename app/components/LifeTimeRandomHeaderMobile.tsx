"use client";

import {
  BackButton,
  buildHeaderControls,
  DarkModeIcon,
  HeaderControlsProps,
  ShareCornerButton,
  SidebarDrawer,
} from "./LifeTimeRandomHeaderShared";

interface LifeTimeRandomHeaderMobileProps extends HeaderControlsProps {
  onClose: () => void;
  onToggleLight: () => void;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
}

export default function LifeTimeRandomHeaderMobile(props: LifeTimeRandomHeaderMobileProps) {
  const {
    light,
    onClose,
    onToggleLight,
    sidebarOpen,
    onCloseSidebar,
    selectedCount,
    onShareSelected,
    sharingSelected,
  } = props;
  const { fineTuneControls, dateRangeRow } = buildHeaderControls(props);

  return (
    <>
      <BackButton onClick={onClose} light={light} />

      <ShareCornerButton
        onClick={onShareSelected}
        disabled={sharingSelected || selectedCount === 0}
        selectedCount={selectedCount}
        light={light}
        positionClassName="absolute top-6 right-3"
      />

      <div className="w-full px-14">
        <h1 className="shrink-0 font-sans text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text text-center">
          See More Of Us
        </h1>
        <p className={`shrink-0 text-center text-xs ${light ? "text-gray-500" : "text-white/60"}`}>
          Straight from our shared Drive folder — if something&apos;s missing, ask your baby to sync it 💕
        </p>
      </div>

      <SidebarDrawer open={sidebarOpen} onClose={onCloseSidebar} light={light} title="Menu">
        <button
          onClick={onToggleLight}
          className={`flex items-center justify-between rounded-full border-2 px-4 py-2.5 text-sm font-medium cursor-pointer ${
            light ? "border-blue-300/60 bg-white/70 text-gray-700 hover:bg-blue-100": "border-pink-300/50 bg-black/50 text-white hover:bg-pink-300/10"
          }`}
        >
          {light ? "Switch to dark mode" : "Switch to bright mode"}
          <DarkModeIcon light={light} />
        </button>

        <div className="flex flex-col gap-3">
          <span
            className={`text-xs font-semibold tracking-wide uppercase ${
              light ? "text-gray-400" : "text-white/40"
            }`}
          >
            Filters
          </span>
          <div className="flex flex-col gap-3">{fineTuneControls}</div>
          {dateRangeRow}
        </div>
      </SidebarDrawer>
    </>
  );
}
