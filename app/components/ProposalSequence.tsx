"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import photosData from "../data/photos.json";
import { proxiedSrc } from "../lib/proxiedSrc";

const STEPS = photosData.proposalSteps;

type ProposalSequenceProps = {
  onClose: () => void;
};

function FinalMediaBackground() {
  const finalMedia = photosData.finalMedia.filter((item) => item.src);
  const [active, setActive] = useState(0);
  const slideCount = finalMedia.length;

  useEffect(() => {
    if (slideCount < 2) return;
    const interval = setInterval(() => {
      setActive((a) => (a + 1) % slideCount);
    }, 3000);
    return () => clearInterval(interval);
  }, [slideCount]);

  if (finalMedia.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900"></div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {finalMedia.map((item, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.type === "video" ? (
            <video
              src={proxiedSrc(item.src)}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={proxiedSrc(item.src)} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProposalSequence({ onClose }: ProposalSequenceProps) {
  const [step, setStep] = useState(0);
  const isThanksScreen = step === STEPS.length - 1;
  const isSecondToLast = step === STEPS.length - 2;

  useEffect(() => {
    if (!isSecondToLast) return;
    const links = photosData.finalMedia
      .filter((item) => item.src)
      .map((item) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = item.type === "video" ? "video" : "image";
        link.href = proxiedSrc(item.src);
        document.head.appendChild(link);
        return link;
      });
    return () => {
      links.forEach((link) => document.head.removeChild(link));
    };
  }, [isSecondToLast]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      {isThanksScreen && (
        <>
          <FinalMediaBackground />
          <div className="fixed inset-0 bg-black/40"></div>
        </>
      )}

      <button
        onClick={onClose}
        aria-label="Back"
        className="absolute top-6 left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div key={step} className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center animate-fade-in-scale">
        <p className="text-xl sm:text-3xl font-medium text-white">{STEPS[step]}</p>
        {!isThanksScreen && (
          <button
            onClick={() => setStep((s) => s + 1)}
            aria-label="Continue"
            className="mt-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
