"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PhotoDetailView from "./PhotoDetailView";
import ProposalSequence from "./ProposalSequence";
import LifeTimeRandom from "./LifeTimeRandom";
import RotatableImage from "./RotatableImage";
import photosData from "../data/photos.json";
import { proxiedSrc, isVideoSrc } from "../lib/proxiedSrc";

const photos = photosData.photos;
const backgrounds = photosData.backgrounds;
const openMeTexts = photosData.openMeTexts;

const UNLOCK_CODE = process.env.NEXT_PUBLIC_UNLOCK_CODE || "1725";
const SHORTCUT_CODE = process.env.NEXT_PUBLIC_SHORTCUT_CODE || "vani";
const MAX_CODE_LENGTH = Math.max(UNLOCK_CODE.length, SHORTCUT_CODE.length);

function CollageBackgroundVideo({ failed, onError }: { failed: boolean; onError: () => void }) {
  if (!backgrounds.collageBackgroundVideo.src || failed) {
    return (
      <div className="fixed inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] animate-spin-slow">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-3xl"></div>
        </div>
        <div className="absolute -bottom-1/2 -right-1/2 h-[200%] w-[200%] animate-spin-reverse">
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 blur-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <video
        src={proxiedSrc(backgrounds.collageBackgroundVideo.src)}
        autoPlay
        muted
        loop
        playsInline
        onError={onError}
        className="absolute top-1/2 left-1/2 object-cover"
        style={{
          width: "100vh",
          height: "100vw",
          transform: "translate(-50%, -50%) rotate(-90deg)",
        }}
      />
    </div>
  );
}

export default function SecretUnlock() {
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [noClicks, setNoClicks] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [showProposal, setShowProposal] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showLifeTimeRandom, setShowLifeTimeRandom] = useState(false);

  useEffect(() => {
    if (!backgrounds.collageBackgroundVideo.src) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = proxiedSrc(backgrounds.collageBackgroundVideo.src);
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (!showMessage) return;
    let cancelled = false;

    const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
    const videoReady = backgrounds.collageBackgroundVideo.src
      ? fetch(proxiedSrc(backgrounds.collageBackgroundVideo.src)).catch(() => {})
      : Promise.resolve();
    const safetyTimeout = new Promise((resolve) => setTimeout(resolve, 10000));

    Promise.all([minDelay, Promise.race([videoReady, safetyTimeout])]).then(() => {
      if (!cancelled) setShowArrow(true);
    });

    return () => {
      cancelled = true;
    };
  }, [showMessage]);

  const noPhrases = ["no", "are you sure?", "pkka?", "phrse socho?", "ask your friend once"];
  const noText = noPhrases[Math.min(noClicks, noPhrases.length - 1)];

  const activeIntroBg = Math.min(noClicks, backgrounds.introBackgrounds.length - 1);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, MAX_CODE_LENGTH);
    setCode(value);

    if (value.length === SHORTCUT_CODE.length && value.toLowerCase() === SHORTCUT_CODE.toLowerCase()) {
      setShowLifeTimeRandom(true);
      return;
    }
    if (value.length === UNLOCK_CODE.length && value === UNLOCK_CODE) {
      setUnlocked(true);
      return;
    }
    if (value.length === MAX_CODE_LENGTH) {
      setShake(true);
      setTimeout(() => {
        setCode("");
        setShake(false);
      }, 400);
    }
  };

  if (showLifeTimeRandom) {
    return <LifeTimeRandom onClose={() => setShowLifeTimeRandom(false)} />;
  }

  if (unlocked && showArrow && !revealed) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-end overflow-hidden bg-black px-4 pr-8 sm:pr-20">
        <CollageBackgroundVideo failed={videoFailed} onError={() => setVideoFailed(true)} />
        <div className="fixed inset-0 bg-black/40"></div>
        <div className="relative z-10 flex flex-col items-center gap-6 text-center animate-fade-in-scale">
          <p className="text-xl sm:text-3xl font-medium text-white">
            Kitni sundar lg rhi ho maggie khate huye
          </p>
          <p className="text-lg sm:text-2xl text-gray-300">chalo ab y dekho</p>
          <button
            onClick={() => setRevealed(true)}
            aria-label="Continue"
            className="mt-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>,
      document.body
    );
  }

  if (unlocked && showMessage && !showArrow && !revealed) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-black">
        {/* Full-screen photo */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-800 via-purple-950 to-black opacity-0 animate-fade-in"
          style={{ animationFillMode: "forwards" }}
        >
          {backgrounds.acknowledgeBackground.src ? (
            isVideoSrc(backgrounds.acknowledgeBackground.src) ? (
              <video
                src={proxiedSrc(backgrounds.acknowledgeBackground.src)}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={proxiedSrc(backgrounds.acknowledgeBackground.src)} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <span className="text-8xl opacity-30">📷</span>
          )}
        </div>

        {/* Darkening overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60"></div>

        <div className="relative z-10 flex flex-col items-center gap-5 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
          <h2 className="px-4 text-center font-sans text-3xl sm:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text">
            {backgrounds.acknowledgeBackground.caption}
          </h2>
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0s" }}></span>
            <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.2s" }}></span>
            <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.4s" }}></span>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (unlocked && !showMessage && !revealed) {
    const activeBg = backgrounds.introBackgrounds[activeIntroBg];
    const activeHasPortrait = !!activeBg.src;
    const activeHasMedia = !activeHasPortrait && !!activeBg.background;

    const renderActionButtons = (light: boolean) => (
      <div className="mt-2 flex items-center gap-4">
        <button
          onClick={() => setShowMessage(true)}
          className={
            light
              ? "rounded-full bg-pink-500 px-8 py-3 text-lg text-white shadow-md shadow-pink-500/20 transition-colors hover:bg-pink-600 cursor-pointer"
              : "rounded-full border-2 border-pink-300/50 bg-black/40 px-8 py-3 text-lg text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
          }
        >
          yes 💖
        </button>
        {noClicks < noPhrases.length && (
          <button
            onClick={() => setNoClicks((n) => n + 1)}
            className={
              light
                ? "rounded-full border-2 border-gray-300 bg-white px-8 py-3 text-lg text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                : "rounded-full border-2 border-gray-500/40 bg-black/40 px-8 py-3 text-lg text-gray-300 backdrop-blur-sm transition-colors hover:border-gray-400/60 cursor-pointer"
            }
          >
            {noText}
          </button>
        )}
      </div>
    );

    if (activeHasMedia) {
      return createPortal(
        <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-black">
          {/* Full-screen photo - all media slots stacked, crossfading via opacity */}
          <div className="absolute inset-0 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
            {backgrounds.introBackgrounds.map(
              (bg, i) =>
                bg.background && (
                  <div
                    key={i}
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
                      i === activeIntroBg ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <RotatableImage src={proxiedSrc(bg.background)} rotate={bg.backgroundRotate} className="h-full w-full object-cover" />
                  </div>
                )
            )}
          </div>

          {/* Darkening overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60"></div>

          <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center animate-fade-in-scale">
            <h2 className="font-sans text-3xl sm:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text">
              Aren&apos;t we cute?
            </h2>
            {renderActionButtons(false)}
          </div>
        </div>,
        document.body
      );
    }

    return createPortal(
      <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-white px-4">
        <div key={activeIntroBg} className="animate-zoom-out-in">
          {activeHasPortrait ? (
            <div className="relative h-[60vh] w-[85vw] max-w-md">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20">
                <RotatableImage src={proxiedSrc(activeBg.src)} rotate={activeBg.srcRotate} className="h-full w-full object-contain" />
              </div>
            </div>
          ) : (
            <span className="text-8xl opacity-30">📷</span>
          )}
        </div>
        <div
          className="flex flex-col items-center gap-6 px-4 text-center opacity-0 animate-fade-in"
          style={{ animationFillMode: "forwards" }}
        >
          <h2 className="font-sans text-3xl sm:text-6xl font-bold tracking-tight text-gray-800">
            Aren&apos;t we cute?
          </h2>
          <p className="text-lg sm:text-2xl text-gray-600">
            Hi baby, do you want to see more of us?
          </p>
          {renderActionButtons(true)}
        </div>
      </div>,
      document.body
    );
  }

  if (unlocked && revealed) {
    return (
      <>
        {createPortal(
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black px-4 py-16">
        <CollageBackgroundVideo failed={videoFailed} onError={() => setVideoFailed(true)} />
        <div className="fixed inset-0 bg-black/40"></div>

        <div className="relative z-10 mx-auto max-w-[1200px] animate-fade-in-scale">
          <h2 className="mb-10 text-center font-sans text-3xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text">
            1725 💖
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-16">
            {photos.map((photo, i) => {
              const captionPreview =
                photo.caption.length > 150 ? photo.caption.slice(0, 150).trimEnd() + "..." : photo.caption;

              return (
                <div
                  key={i}
                  onClick={() => setSelectedPhoto(i)}
                  className="group flex h-[420px] flex-col overflow-hidden rounded-2xl border-2 border-slate-400 bg-slate-300 cursor-pointer transition-colors hover:border-slate-500"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="relative flex-[3] overflow-hidden flex items-center justify-center text-gray-400 text-sm">
                    {photo.src ? (
                      <>
                        <RotatableImage
                          src={proxiedSrc(photo.src)}
                          rotate={photo.srcRotate}
                          className="h-full w-full scale-110 object-cover blur-md transition-all duration-300 group-hover:blur-sm"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/30 transition-colors group-hover:bg-black/10">
                          <span className="inline-block" style={{ perspective: "300px" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/icons/double-heart.png"
                              alt=""
                              className="animate-wobble-horizontal h-14 w-14 object-contain drop-shadow-lg"
                            />
                          </span>
                          <span className="text-sm font-medium italic text-white drop-shadow-md">
                            {openMeTexts[i % openMeTexts.length]}
                          </span>
                        </div>
                      </>
                    ) : (
                      "photo"
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden px-3 py-2">
                    <p className="text-xs leading-relaxed text-gray-600 line-clamp-8">{captionPreview}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-32 flex flex-wrap justify-center gap-4 pb-10">
            <button
              onClick={() => setShowProposal(true)}
              className="rounded-full border-2 border-pink-300/50 bg-black/40 px-8 py-3 text-lg text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
            >
              click me now
            </button>
            <button
              onClick={() => setShowLifeTimeRandom(true)}
              className="rounded-full border-2 border-pink-300/50 bg-black/40 px-8 py-3 text-lg text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
            >
              random moments 💖
            </button>
          </div>
        </div>
      </div>,
          document.body
        )}
        {selectedPhoto !== null && (
          <PhotoDetailView index={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        )}
        {showProposal && <ProposalSequence onClose={() => setShowProposal(false)} />}
      </>
    );
  }

  return (
    <>
      <p className="text-sm sm:text-base text-gray-400 italic">
        Enter the number that makes the two of us
      </p>

      <input
        type="text"
        inputMode="text"
        value={code}
        onChange={handleCodeChange}
        placeholder="secret code?"
        maxLength={MAX_CODE_LENGTH}
        className={`w-40 sm:w-48 rounded-full border-2 border-pink-300/40 bg-black/40 px-5 py-2 text-center text-lg text-white placeholder-gray-500 tracking-[0.3em] backdrop-blur-sm outline-none transition-colors focus:border-pink-300/80 ${shake ? "animate-shake" : ""}`}
      />
    </>
  );
}
