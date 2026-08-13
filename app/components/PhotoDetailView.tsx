"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import photosData from "../data/photos.json";
import { proxiedSrc } from "../lib/proxiedSrc";
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
  const [closingCaption, setClosingCaption] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const photo = photos[index] ?? photos[0];
  const orientation = photo.orientation === "landscape" ? "landscape" : "portrait";
  const layoutClass = orientation === "landscape" ? "flex-col" : "flex-col md:flex-row";

  useEffect(() => {
    if (closing) {
      const timer = setTimeout(onClose, 1100);
      return () => clearTimeout(timer);
    }
  }, [closing, onClose]);

  useEffect(() => {
    const nextPhoto = photos[index + 1];
    if (!nextPhoto?.backgroundVideo) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = proxiedSrc(nextPhoto.backgroundVideo);
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [index]);

  if (closing) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-800 via-purple-950 to-black opacity-0 animate-fade-in"
          style={{ animationFillMode: "forwards" }}
        >
          {backgrounds.acknowledgeBackground.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={proxiedSrc(backgrounds.acknowledgeBackground.src)} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-8xl opacity-30">📷</span>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60"></div>
        <h2
          className="relative z-10 px-4 text-center font-sans text-3xl sm:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text opacity-0 animate-fade-in"
          style={{ animationFillMode: "forwards" }}
        >
          {closingCaption}
        </h2>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className={`fixed inset-0 z-50 flex ${layoutClass} overflow-hidden bg-black animate-fade-in`}>
      {photo.backgroundVideo && (
        <>
          <video
            src={proxiedSrc(photo.backgroundVideo)}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setVideoReady(true)}
            className={`fixed inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
          <div className="fixed inset-0 bg-black/50"></div>
          {!videoReady && (
            <div className="fixed inset-0 z-20 flex items-center justify-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0s" }}></span>
              <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.2s" }}></span>
              <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.4s" }}></span>
            </div>
          )}
        </>
      )}

      {/* Photo - top for landscape, left (top on mobile) for portrait */}
      <div
        className={
          orientation === "landscape"
            ? "relative z-10 h-[65%] w-full shrink-0 p-[50px]"
            : "relative z-10 h-2/5 md:h-full w-full shrink-0 md:w-1/2 p-[50px]"
        }
      >
        <PhotoCard src={photo.src} rotate={photo.srcRotate} background={photo.cardBackground} />
      </div>

      {/* Text - bottom for landscape, right (bottom on mobile) for portrait */}
      <div
        className={
          orientation === "landscape"
            ? `relative z-10 flex flex-1 w-full flex-col items-center justify-start gap-4 overflow-y-auto px-8 py-10 text-center ${photo.backgroundVideo ? "" : "bg-black"}`
            : `relative z-10 flex flex-1 md:h-full w-full md:w-1/2 flex-col items-center justify-start gap-4 overflow-y-auto px-8 py-10 text-center ${photo.backgroundVideo ? "" : "bg-black"}`
        }
      >
        <div className="flex flex-col items-center gap-2 animate-float-text">
          <h2 className="font-sans text-2xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text">
            Memory #{index + 1}
          </h2>
          <p className="max-w-lg text-left text-base sm:text-lg leading-relaxed text-white">
            {photo.caption}
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          const captions = backgrounds.closingCaptions;
          setClosingCaption(captions[Math.floor(Math.random() * captions.length)]);
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
