import { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import { accentGradientClass } from "./LifeTimeRandomHeaderShared";

export interface Photo {
  id: string;
  name: string;
  src: string;
  isVideo: boolean;
  rotation: number;
}

function RotatablePhoto({
  photo,
  className,
  muted = true,
  controls = false,
  natural = false,
  fitHeight = false,
  onAspectRatio,
}: {
  photo: Photo;
  className: string;
  muted?: boolean;
  controls?: boolean;
  natural?: boolean;
  fitHeight?: boolean;
  onAspectRatio?: (ratio: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = photo.src;
  const upright = photo.rotation % 180 === 0;
  const handleLoad = () => setLoaded(true);
  const handleVideoReady = () => {
    setLoaded(true);
    videoRef.current?.play().catch(() => {});
  };

  const loader = !loaded && <div className="absolute inset-0 z-10 skeleton-shimmer"></div>;

  // Natural mode: size the tile to the media's real aspect ratio (scaled to
  // fill the column width) instead of forcing it into a fixed box, so no
  // letterboxing. Reuses the same rotated-container-query trick, but the
  // wrapper's own shape comes from the loaded media's intrinsic dimensions.
  if (natural) {
    const effectiveRatio = aspectRatio ? (upright ? aspectRatio : 1 / aspectRatio) : 1;
    const mediaStyle = {
      opacity: loaded ? 1 : 0,
      transition: "opacity 0.3s ease",
      ...(upright
        ? { transform: photo.rotation ? `rotate(${photo.rotation}deg)` : undefined }
        : {
            width: "100cqh",
            height: "100cqw",
            transform: `translate(-50%, -50%) rotate(${photo.rotation}deg)`,
          }),
    };
    const mediaClassName = upright
      ? `absolute inset-0 h-full w-full object-contain ${className}`
      : `absolute top-1/2 left-1/2 object-contain ${className}`;

    return (
      <div
        className={`relative overflow-hidden ${fitHeight ? "h-full" : "w-full"}`}
        style={{ aspectRatio: effectiveRatio, containerType: "size" }}
      >
        {photo.isVideo ? (
          <video
            ref={videoRef}
            src={src}
            muted={muted}
            controls={controls}
            loop
            playsInline
            className={mediaClassName}
            style={mediaStyle}
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth && v.videoHeight) {
                const raw = v.videoWidth / v.videoHeight;
                setAspectRatio(raw);
                onAspectRatio?.(raw);
              }
            }}
            onCanPlayThrough={handleVideoReady}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={photo.name}
            className={mediaClassName}
            style={mediaStyle}
            onLoad={(e) => {
              const img = e.currentTarget;
              const raw = img.naturalWidth / img.naturalHeight;
              setAspectRatio(raw);
              onAspectRatio?.(raw);
              handleLoad();
            }}
          />
        )}
        {loader}
      </div>
    );
  }

  if (upright) {
    const style = {
      ...(photo.rotation ? { transform: `rotate(${photo.rotation}deg)` } : {}),
      opacity: loaded ? 1 : 0,
      transition: "opacity 0.3s ease",
    };
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        {photo.isVideo ? (
          <video ref={videoRef} src={src} muted={muted} controls={controls} loop playsInline className={className} style={style} onCanPlayThrough={handleVideoReady} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={photo.name} className={className} style={style} onLoad={handleLoad} />
        )}
        {loader}
      </div>
    );
  }

  const rotatedStyle = {
    width: "100cqh",
    height: "100cqw",
    transform: `translate(-50%, -50%) rotate(${photo.rotation}deg)`,
    opacity: loaded ? 1 : 0,
    transition: "opacity 0.3s ease",
  } as const;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ containerType: "size" }}>
      {photo.isVideo ? (
        <video
          ref={videoRef}
          src={src}
          muted={muted}
          controls={controls}
          loop
          playsInline
          className={`absolute top-1/2 left-1/2 ${className}`}
          style={rotatedStyle}
          onCanPlayThrough={handleVideoReady}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={photo.name}
          className={`absolute top-1/2 left-1/2 ${className}`}
          style={rotatedStyle}
          onLoad={handleLoad}
        />
      )}
      {loader}
    </div>
  );
}

function IconButton({
  onClick,
  label,
  light,
  loading = false,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  light: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!loading) onClick(e);
      }}
      disabled={loading}
      aria-label={label}
      aria-busy={loading}
      className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 backdrop-blur-sm transition-colors disabled:cursor-wait ${
        light ? "border-blue-300/60 bg-white/70 text-gray-700 hover:border-blue-400 hover:bg-blue-100": "border-pink-300/50 bg-black/50 text-white hover:border-pink-300/90 hover:bg-pink-300/10"
      } ${loading ? "" : "cursor-pointer"}`}
    >
      {loading ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 sm:h-5 sm:w-5 animate-spin">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}

function PhotoTile({
  photo,
  light,
  onRotate,
  onSelect,
  className = "",
  style,
  natural = false,
  fitHeight = false,
  objectFit = "contain",
  selected = false,
  onToggleSelect,
  spanLandscapeFullWidth = false,
}: {
  photo: Photo;
  light: boolean;
  onRotate: () => void;
  onSelect: () => void;
  className?: string;
  style?: React.CSSProperties;
  natural?: boolean;
  fitHeight?: boolean;
  objectFit?: "contain" | "cover";
  selected?: boolean;
  onToggleSelect?: () => void;
  spanLandscapeFullWidth?: boolean;
}) {
  const [rawRatio, setRawRatio] = useState<number | null>(null);
  const upright = photo.rotation % 180 === 0;
  const effectiveRatio = rawRatio !== null ? (upright ? rawRatio : 1 / rawRatio) : null;
  const isLandscape = effectiveRatio !== null && effectiveRatio > 1.15;

  return (
    <div
      onClick={onSelect}
      className={`group relative flex min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-3xl shadow-2xl shadow-black/50 transition-all ${
        light ? "bg-white" : "bg-black"
      } ${selected ? (light ? "ring-4 ring-blue-400" : "ring-4 ring-pink-400") : ""} ${className}`}
      style={{
        ...style,
        ...(spanLandscapeFullWidth && isLandscape ? { columnSpan: "all" as const } : {}),
      }}
    >
      <RotatablePhoto
        photo={photo}
        className={natural ? "" : `h-full w-full object-${objectFit}`}
        natural={natural}
        fitHeight={fitHeight}
        onAspectRatio={natural ? setRawRatio : undefined}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect?.();
        }}
        data-screenshot-ignore
        aria-label={selected ? "Deselect photo" : "Select photo"}
        className={`absolute top-2 left-2 sm:top-3 sm:left-3 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 backdrop-blur-sm cursor-pointer ${
          selected
            ? `border-transparent text-white ${accentGradientClass(light)}`
            : light
              ? "border-gray-400 bg-white/70"
              : "border-white/50 bg-black/40"
        }`}
      >
        {selected && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </button>

      <div data-screenshot-ignore className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
        <IconButton onClick={onRotate} label="Rotate photo clockwise" light={light}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5">
            <path d="M21 12a9 9 0 1 1-3.2-6.9" />
            <path d="M21 3v6h-6" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}

function PhotoMaxView({
  photo,
  onClose,
  onPrev,
  onNext,
  showNav,
}: {
  photo: Photo;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  showNav: boolean;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-2 sm:p-4"
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {showNav && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous photo"
            className="absolute left-2 sm:left-4 top-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/40 text-white backdrop-blur-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next photo"
            className="absolute right-2 sm:right-4 top-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/40 text-white backdrop-blur-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 sm:h-6 sm:w-6">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <div
        className="relative flex items-center justify-center"
        style={{ height: "92vh", width: "96vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        <RotatablePhoto
          photo={photo}
          className="max-h-full max-w-full object-contain"
          muted={false}
          controls={photo.isVideo}
        />
      </div>
    </div>,
    document.body
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function composeCollage(node: HTMLElement, light: boolean): Promise<Blob> {
  const backgroundColor = light ? "#ffffff" : "#000000";
  const collageDataUrl = await toPng(node, {
    backgroundColor,
    pixelRatio: 3,
    includeQueryParams: true,
    filter: (el) => !(el instanceof Element) || !el.hasAttribute("data-screenshot-ignore"),
  });
  const collageImg = await loadImage(collageDataUrl);

  const margin = 10;
  const titleHeight = 64;
  const canvas = document.createElement("canvas");
  canvas.width = collageImg.width + margin * 2;
  canvas.height = collageImg.height + titleHeight + margin * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const title = "Daksh & Vanshika 💕";
  ctx.font = "700 32px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const textWidth = ctx.measureText(title).width;
  const textCenterY = margin + titleHeight / 2 - 6;

  ctx.save();
  ctx.shadowColor = "rgba(219, 39, 119, 0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  const gradient = ctx.createLinearGradient(
    canvas.width / 2 - textWidth / 2,
    0,
    canvas.width / 2 + textWidth / 2,
    0
  );
  gradient.addColorStop(0, "#f472b6");
  gradient.addColorStop(1, "#c084fc");
  ctx.fillStyle = gradient;
  ctx.fillText(title, canvas.width / 2, textCenterY);
  ctx.restore();

  const underlineWidth = Math.min(textWidth * 0.6, 160);
  const underlineY = textCenterY + 26;
  const underlineGradient = ctx.createLinearGradient(
    canvas.width / 2 - underlineWidth / 2,
    0,
    canvas.width / 2 + underlineWidth / 2,
    0
  );
  underlineGradient.addColorStop(0, "rgba(244, 114, 182, 0)");
  underlineGradient.addColorStop(0.5, "rgba(192, 132, 252, 0.8)");
  underlineGradient.addColorStop(1, "rgba(244, 114, 182, 0)");
  ctx.fillStyle = underlineGradient;
  ctx.fillRect(canvas.width / 2 - underlineWidth / 2, underlineY, underlineWidth, 2);

  ctx.drawImage(collageImg, margin, margin + titleHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image"))), "image/png");
  });
}

function collageFileName() {
  return `daksh-vanshika-${Date.now()}.png`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadCollage(node: HTMLElement, light: boolean) {
  const blob = await composeCollage(node, light);
  downloadBlob(blob, collageFileName());
}

export async function shareCollage(node: HTMLElement, light: boolean) {
  const blob = await composeCollage(node, light);
  const fileName = collageFileName();
  const file = new File([blob], fileName, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }
  downloadBlob(blob, fileName);
}

export interface LifeTimeRandomSlidesHandle {
  captureScreenshot: (mode: "share" | "download") => Promise<void>;
}

interface LifeTimeRandomSlidesProps {
  photos: Photo[];
  batch: number;
  currentIndex: number;
  light: boolean;
  loading: boolean;
  isNarrow: boolean;
  showSingle: boolean;
  pinterestMode: boolean;
  selectedPhoto: Photo | null;
  setSelectedPhoto: (photo: Photo | null) => void;
  onPhotoTap: (photo: Photo) => void;
  onRotatePhoto: (id: string) => void;
  goPrev: () => void;
  goNext: () => void;
  onMaxViewPrev: () => void;
  onMaxViewNext: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  cardDragStyle: React.CSSProperties;
  likeOpacity: number;
  dislikeOpacity: number;
  selectedIds: Set<string>;
  onToggleSelectPhoto: (id: string) => void;
  masonryCols: number;
}

const LifeTimeRandomSlides = forwardRef<LifeTimeRandomSlidesHandle, LifeTimeRandomSlidesProps>(function LifeTimeRandomSlides({
  photos,
  batch,
  currentIndex,
  light,
  loading,
  isNarrow,
  showSingle,
  pinterestMode,
  selectedPhoto,
  setSelectedPhoto,
  onPhotoTap,
  onRotatePhoto,
  goPrev,
  goNext,
  onMaxViewPrev,
  onMaxViewNext,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  cardDragStyle,
  likeOpacity,
  dislikeOpacity,
  selectedIds,
  onToggleSelectPhoto,
  masonryCols,
}, ref) {
  const rawCols = Math.ceil(Math.sqrt(photos.length || 1));
  const cols = isNarrow
    ? Math.min(rawCols, 2)
    : photos.length > 0 && photos.length <= 3
      ? photos.length
      : masonryCols;
  const rows = Math.max(1, Math.ceil((photos.length || 1) / cols));
  const fitGrid = !isNarrow && !pinterestMode;
  const currentPhoto = photos[currentIndex];
  const masonryRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  useImperativeHandle(ref, () => ({
    captureScreenshot: async (mode) => {
      if (!masonryRef.current || capturing) return;
      setCapturing(true);
      try {
        await (mode === "share" ? shareCollage : downloadCollage)(masonryRef.current, light);
      } catch (err) {
        console.error("Screenshot failed:", err);
      } finally {
        setCapturing(false);
      }
    },
  }));

  return (
    <>
      <div
        className={`relative w-full ${showSingle ? "-mt-7 sm:mt-4" : "mt-4 sm:mt-8"} ${
          fitGrid ? "min-h-0 flex-1 flex flex-col" : ""
        }`}
      >
        {loading && (
          isNarrow ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center py-10">
              <div className="aspect-[2/3] w-[82%] sm:w-[70%] max-w-md rounded-3xl skeleton-shimmer"></div>
            </div>
          ) : (
            <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-2">
              <div
                className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm ${
                  light ? "border-blue-300/60 bg-white/90 text-gray-700" : "border-pink-300/40 bg-black/80 text-white"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Loading photos…
              </div>
            </div>
          )
        )}

        {showSingle ? (
          <div
            className={`relative flex w-full items-center justify-center transition-opacity duration-300 ${loading ? "opacity-30" : "opacity-100"}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {currentPhoto && (
              <PhotoTile
                key={`${batch}-${currentPhoto.id}`}
                photo={currentPhoto}
                light={light}
                objectFit="contain"
                selected={selectedIds.has(currentPhoto.id)}
                onToggleSelect={() => onToggleSelectPhoto(currentPhoto.id)}
                onRotate={() => onRotatePhoto(currentPhoto.id)}
                onSelect={() => onPhotoTap(currentPhoto)}
                className="aspect-[2/3] w-[82%] sm:w-[70%] max-w-md animate-zoom-out-in"
                style={cardDragStyle}
              />
            )}

            {likeOpacity > 0 && (
              <div
                className="pointer-events-none absolute top-6 left-6 z-20 -rotate-12 text-6xl drop-shadow-lg"
                style={{ opacity: likeOpacity, transform: `scale(${0.7 + likeOpacity * 0.3})` }}
              >
                😍
              </div>
            )}
            {dislikeOpacity > 0 && (
              <div
                className="pointer-events-none absolute top-6 right-6 z-20 rotate-12 text-6xl drop-shadow-lg"
                style={{ opacity: dislikeOpacity, transform: `scale(${0.7 + dislikeOpacity * 0.3})` }}
              >
                😢
              </div>
            )}

            {photos.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  aria-label="Previous photo"
                  className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/40 text-white backdrop-blur-sm cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={goNext}
                  aria-label="Next photo"
                  className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/40 text-white backdrop-blur-sm cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                  {photos.map((p, idx) => (
                    <span
                      key={p.id}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        idx === currentIndex ? "bg-pink-400" : light ? "bg-gray-300" : "bg-white/30"
                      }`}
                    ></span>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : !pinterestMode ? (
          <div
            ref={masonryRef}
            className={`mx-auto grid min-h-0 w-full max-w-6xl flex-1 gap-3 sm:gap-4 ${photos.length <= 3 ? "sm:mt-6" : ""} transition-opacity duration-300 ${loading ? "opacity-30" : "opacity-100"}`}
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
          >
            {photos.map((photo, i) => (
              <PhotoTile
                key={`${batch}-${photo.id}`}
                photo={photo}
                light={light}
                objectFit="contain"
                selected={selectedIds.has(photo.id)}
                onToggleSelect={() => onToggleSelectPhoto(photo.id)}
                onRotate={() => onRotatePhoto(photo.id)}
                onSelect={() => setSelectedPhoto(photo)}
                className="h-full w-full animate-zoom-out-in"
                style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "backwards" }}
              />
            ))}
          </div>
        ) : (
          <div className="relative w-full">
            <div
              ref={masonryRef}
              className={`w-full transition-opacity duration-300 ${loading ? "opacity-30" : "opacity-100"}`}
              style={{ columnCount: masonryCols, columnGap: "0.75rem" }}
            >
              {photos.map((photo, i) => (
                <PhotoTile
                  key={`${batch}-${photo.id}`}
                  photo={photo}
                  light={light}
                  natural
                  selected={selectedIds.has(photo.id)}
                  onToggleSelect={() => onToggleSelectPhoto(photo.id)}
                  onRotate={() => onRotatePhoto(photo.id)}
                  onSelect={() => setSelectedPhoto(photo)}
                  spanLandscapeFullWidth={isNarrow && masonryCols <= 2}
                  className="mb-3 w-full break-inside-avoid animate-zoom-out-in"
                  style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "backwards" }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPhoto && (
        <PhotoMaxView
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onPrev={onMaxViewPrev}
          onNext={onMaxViewNext}
          showNav={photos.length > 1}
        />
      )}
    </>
  );
});

export default LifeTimeRandomSlides;
