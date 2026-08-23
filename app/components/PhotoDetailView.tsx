"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import photosData from "../data/photos.json";
import { proxiedSrc, isVideoSrc } from "../lib/proxiedSrc";
import RotatableImage from "./RotatableImage";

type PhotoDetailViewProps = {
  index: number;
  onClose: () => void;
};

const photos = photosData.photos;
const backgrounds = photosData.backgrounds;

function PhotoCard({ src, rotate, background }: { src: string; rotate?: boolean; background: string }) {
  return (
    <div className="h-full w-full animate-float-text">
      <div
        className="h-full w-full overflow-hidden rounded-3xl shadow-2xl shadow-black/50 transition-transform duration-300 hover:scale-105 flex items-center justify-center"
        style={{ backgroundColor: background }}
      >
        {src ? (
          <RotatableImage src={proxiedSrc(src)} rotate={rotate} className="h-full w-full object-contain" />
        ) : (
          <span className="text-8xl opacity-30">📷</span>
        )}
      </div>
    </div>
  );
}

export default function PhotoDetailView({ index, onClose }: PhotoDetailViewProps) {
  const [closing, setClosing] = useState(false);
  const [closingScreen, setClosingScreen] = useState<(typeof backgrounds.closingCaptions)[number] | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const photo = photos[index] ?? photos[0];
  const side = photo.side === "right" ? "right" : "left";
  const layoutClass = side === "right" ? "flex-col md:flex-row-reverse" : "flex-col md:flex-row";

  useEffect(() => {
    if (closing) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [closing, onClose]);

  useEffect(() => {
    const nextPhoto = photos[index + 1];
    if (!nextPhoto?.background) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = isVideoSrc(nextPhoto.background) ? "video" : "image";
    link.href = proxiedSrc(nextPhoto.background);
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [index]);

  if (closing) {
    const hasPortrait = !!closingScreen?.src;
    const hasBackground = !hasPortrait && !!closingScreen?.background;

    if (hasBackground) {
      return createPortal(
        <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-black">
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 animate-fade-in"
            style={{ animationFillMode: "forwards" }}
          >
            {isVideoSrc(closingScreen!.background) ? (
              <video
                src={proxiedSrc(closingScreen!.background)}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={proxiedSrc(closingScreen!.background)} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60"></div>
          <h2
            className="relative z-10 px-4 text-center font-sans text-3xl sm:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text opacity-0 animate-fade-in"
            style={{ animationFillMode: "forwards" }}
          >
            {closingScreen?.caption}
          </h2>
        </div>,
        document.body
      );
    }

    return createPortal(
      <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-white px-4">
        {hasPortrait ? (
          <div
            className="relative h-[60vh] w-[85vw] max-w-md opacity-0 animate-fade-in-scale"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20">
              <RotatableImage
                src={proxiedSrc(closingScreen!.src)}
                rotate={closingScreen!.srcRotate}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        ) : (
          <span className="text-8xl opacity-30">📷</span>
        )}
        <h2
          className="relative z-10 px-4 text-center font-sans text-3xl sm:text-6xl font-bold tracking-tight text-gray-800 opacity-0 animate-fade-in"
          style={{ animationFillMode: "forwards" }}
        >
          {closingScreen?.caption}
        </h2>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className={`fixed inset-0 z-50 flex ${layoutClass} overflow-hidden bg-black animate-fade-in`}>
      {photo.background && (
        <>
          {isVideoSrc(photo.background) ? (
            <video
              src={proxiedSrc(photo.background)}
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={() => setVideoReady(true)}
              className={`fixed object-cover transition-opacity duration-700 ${
                videoReady ? "opacity-100" : "opacity-0"
              } ${photo.backgroundRotate ? "" : "inset-0 h-full w-full"}`}
              style={
                photo.backgroundRotate
                  ? { top: "50%", left: "50%", width: "100vh", height: "100vw", transform: "translate(-50%, -50%) rotate(-90deg)" }
                  : undefined
              }
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proxiedSrc(photo.background)}
              alt=""
              className={`fixed object-cover ${photo.backgroundRotate ? "" : "inset-0 h-full w-full"}`}
              style={
                photo.backgroundRotate
                  ? { top: "50%", left: "50%", width: "100vh", height: "100vw", transform: "translate(-50%, -50%) rotate(-90deg)" }
                  : undefined
              }
            />
          )}
          <div className="fixed inset-0 bg-black/50"></div>
          {isVideoSrc(photo.background) && !videoReady && (
            <div className="fixed inset-0 z-20 flex items-center justify-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0s" }}></span>
              <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.2s" }}></span>
              <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.4s" }}></span>
            </div>
          )}
        </>
      )}

      {/* Photo - top on mobile, left/right on desktop per photo.side */}
      <div className="relative z-10 h-2/5 md:h-full w-full shrink-0 md:w-1/2 p-[50px]">
        <PhotoCard src={photo.src} rotate={photo.srcRotate} background={photo.cardBackground} />
      </div>

      {/* Text - bottom on mobile, opposite side of photo on desktop */}
      <div
        className={`relative z-10 flex flex-1 md:h-full w-full md:w-1/2 flex-col items-center justify-center gap-4 overflow-y-auto px-8 py-10 text-center ${photo.background ? "" : "bg-black"}`}
      >
        <div className="flex flex-col items-center gap-3 max-w-lg rounded-3xl border border-white/10 bg-black/30 px-6 py-6 backdrop-blur-md shadow-xl shadow-black/40 animate-float-text">
          <h2 className="font-sans text-2xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Memory #{index + 1}
          </h2>
          <p className="text-center text-base sm:text-lg leading-relaxed text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
            {photo.caption}
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          const screens = backgrounds.closingCaptions;
          setClosingScreen(screens[Math.floor(Math.random() * screens.length)]);
          setClosing(true);
        }}
        aria-label="Back"
        className="absolute top-6 left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>,
    document.body
  );
}
