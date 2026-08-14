"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import photosData from "../data/photos.json";
import { proxiedSrc, isVideoSrc } from "../lib/proxiedSrc";
import RotatableImage from "./RotatableImage";

const STEPS = photosData.proposalSteps;
const FINAL_MEDIA = photosData.finalMedia.filter((item) => item.src);

type ProposalSequenceProps = {
  onClose: () => void;
};

function FinalMediaLayer({ item }: { item: (typeof FINAL_MEDIA)[number] }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <div className="relative h-[60vh] w-[85vw] max-w-md">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20">
          <RotatableImage src={proxiedSrc(item.src)} rotate={item.srcRotate} className="h-full w-full object-contain" />
        </div>
      </div>
    </div>
  );
}

export default function ProposalSequence({ onClose }: ProposalSequenceProps) {
  const [step, setStep] = useState(0);
  const [finalActive, setFinalActive] = useState(0);
  const isThanksScreen = step === STEPS.length - 1;
  const isSecondToLast = step === STEPS.length - 2;

  useEffect(() => {
    if (FINAL_MEDIA.length < 2) return;
    const interval = setInterval(() => {
      setFinalActive((a) => (a + 1) % FINAL_MEDIA.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isSecondToLast) return;
    const links = FINAL_MEDIA.map((item) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = isVideoSrc(item.src) ? "video" : "image";
      link.href = proxiedSrc(item.src);
      document.head.appendChild(link);
      return link;
    });
    return () => {
      links.forEach((link) => document.head.removeChild(link));
    };
  }, [isSecondToLast]);

  const backButton = (light: boolean) => (
    <button
      onClick={onClose}
      aria-label="Back"
      className={
        light
          ? "absolute top-6 left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
          : "absolute top-6 left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
      }
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );

  if (isThanksScreen) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-white px-4">
        {FINAL_MEDIA.length === 0 ? (
          <span className="text-8xl opacity-30">📷</span>
        ) : (
          <div className="relative h-[60vh] w-[85vw] max-w-md opacity-0 animate-fade-in-scale" style={{ animationFillMode: "forwards" }}>
            {FINAL_MEDIA.map((item, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  i === finalActive ? "opacity-100" : "opacity-0"
                }`}
              >
                <FinalMediaLayer item={item} />
              </div>
            ))}
          </div>
        )}

        {backButton(true)}

        <p
          className="relative z-10 max-w-2xl px-4 text-xl sm:text-3xl font-medium text-gray-800 text-center opacity-0 animate-fade-in"
          style={{ animationFillMode: "forwards" }}
        >
          {STEPS[step]}
        </p>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      {backButton(false)}

      <div key={step} className="relative z-10 flex max-w-2xl flex-col items-center gap-6 text-center animate-fade-in-scale">
        <p className="text-xl sm:text-3xl font-medium text-white">{STEPS[step]}</p>
        <button
          onClick={() => setStep((s) => s + 1)}
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
