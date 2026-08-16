"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BackButton,
  buildHeaderControls,
  cornerButtonClass,
  DarkModeIcon,
  HeaderControlsProps,
} from "./LifeTimeRandomHeaderShared";

const DRAWER_TRANSITION_MS = 250;

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

  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [prevSidebarOpen, setPrevSidebarOpen] = useState(sidebarOpen);

  if (sidebarOpen !== prevSidebarOpen) {
    setPrevSidebarOpen(sidebarOpen);
    if (sidebarOpen) {
      setDrawerMounted(true);
    } else {
      setDrawerVisible(false);
    }
  }

  useEffect(() => {
    if (!sidebarOpen || !drawerMounted) return;
    const raf = requestAnimationFrame(() => setDrawerVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [sidebarOpen, drawerMounted]);

  useEffect(() => {
    if (sidebarOpen || !drawerMounted) return;
    const timer = setTimeout(() => setDrawerMounted(false), DRAWER_TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [sidebarOpen, drawerMounted]);

  return (
    <>
      <BackButton onClick={onClose} light={light} />

      <button
        onClick={onShareSelected}
        disabled={sharingSelected || selectedCount === 0}
        aria-label={selectedCount > 0 ? `Share ${selectedCount} selected` : "Select photos to share"}
        className={`absolute top-6 right-3 disabled:opacity-40 disabled:cursor-not-allowed ${cornerButtonClass(light)}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        {selectedCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${
              light ? "bg-blue-500" : "bg-pink-500"
            }`}
          >
            {selectedCount}
          </span>
        )}
      </button>

      <div className="w-full px-14">
        <h1 className="shrink-0 font-sans text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text text-center">
          See More Of Us
        </h1>
        <p className={`shrink-0 text-center text-xs ${light ? "text-gray-500" : "text-white/60"}`}>
          Straight from our shared Drive folder — if something&apos;s missing, ask your baby to sync it 💕
        </p>
      </div>

      {drawerMounted &&
        createPortal(
          <div className="fixed inset-0 z-[80] flex justify-end">
            <div
              className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ease-out ${
                drawerVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDuration: `${DRAWER_TRANSITION_MS}ms` }}
              onClick={onCloseSidebar}
            />
            <div
              className={`relative flex h-full w-[68%] max-w-[280px] flex-col gap-6 overflow-y-auto px-5 py-6 shadow-2xl transition-transform ease-out ${
                drawerVisible ? "translate-x-0" : "translate-x-full"
              } ${light ? "bg-white text-gray-900" : "bg-gray-950 text-white"}`}
              style={{ transitionDuration: `${DRAWER_TRANSITION_MS}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">Menu</span>
                <button
                  onClick={onCloseSidebar}
                  aria-label="Close menu"
                  className={
                    light ? "flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-300/60 bg-white/70 text-gray-700 cursor-pointer": "flex h-8 w-8 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white cursor-pointer"
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

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
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
