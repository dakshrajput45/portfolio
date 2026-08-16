"use client";

import { BackButton, HeaderControlsProps, ShareCornerButton } from "./LifeTimeRandomHeaderShared";

interface LifeTimeRandomHeaderDesktopProps extends HeaderControlsProps {
  onClose: () => void;
}

export default function LifeTimeRandomHeaderDesktop(props: LifeTimeRandomHeaderDesktopProps) {
  const { light, onClose, selectedCount, onShareSelected, sharingSelected } = props;

  return (
    <>
      <BackButton onClick={onClose} light={light} />
      <ShareCornerButton
        onClick={onShareSelected}
        disabled={sharingSelected || selectedCount === 0}
        selectedCount={selectedCount}
        light={light}
        positionClassName="absolute top-2 right-2 sm:top-6 sm:right-6"
      />

      <h1 className="shrink-0 font-sans text-2xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text">
        See More Of Us
      </h1>
      <p className={`shrink-0 text-center text-xs sm:text-sm ${light ? "text-gray-500" : "text-white/60"}`}>
        Straight from our shared Drive folder — if something&apos;s missing, ask your baby to sync it 💕
      </p>
    </>
  );
}
