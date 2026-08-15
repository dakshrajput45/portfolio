import { useState, useRef } from "react";
import { createPortal } from "react-dom";

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
}: {
  photo: Photo;
  className: string;
  muted?: boolean;
  controls?: boolean;
  natural?: boolean;
  fitHeight?: boolean;
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

  const loader = !loaded && (
    <div className="absolute inset-0 z-10 flex items-center justify-center gap-3">
      <span className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0s" }}></span>
      <span className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.2s" }}></span>
      <span className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.4s" }}></span>
    </div>
  );

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
              if (v.videoWidth && v.videoHeight) setAspectRatio(v.videoWidth / v.videoHeight);
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
              setAspectRatio(img.naturalWidth / img.naturalHeight);
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
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
  light: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={label}
      className={
        light
          ? "flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 border-pink-400/60 bg-white/70 text-gray-700 backdrop-blur-sm transition-colors hover:border-pink-400 hover:bg-pink-100 cursor-pointer"
          : "flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 border-pink-300/50 bg-black/50 text-white backdrop-blur-sm transition-colors hover:border-pink-300/90 hover:bg-pink-300/10 cursor-pointer"
      }
    >
      {children}
    </button>
  );
}

function PhotoTile({
  photo,
  light,
  onRotate,
  onShare,
  onSelect,
  className = "",
  style,
  natural = false,
  fitHeight = false,
  objectFit = "contain",
  selected = false,
  onToggleSelect,
}: {
  photo: Photo;
  light: boolean;
  onRotate: () => void;
  onShare: () => void;
  onSelect: () => void;
  className?: string;
  style?: React.CSSProperties;
  natural?: boolean;
  fitHeight?: boolean;
  objectFit?: "contain" | "cover";
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-3xl shadow-2xl shadow-black/50 transition-all ${
        light ? "bg-white" : "bg-black"
      } ${selected ? "ring-4 ring-pink-400" : ""} ${className}`}
      style={style}
    >
      <RotatablePhoto
        photo={photo}
        className={natural ? "" : `h-full w-full object-${objectFit}`}
        natural={natural}
        fitHeight={fitHeight}
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect?.();
        }}
        aria-label={selected ? "Deselect photo" : "Select photo"}
        className={`absolute top-2 left-2 sm:top-3 sm:left-3 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 backdrop-blur-sm cursor-pointer ${
          selected
            ? "border-transparent bg-gradient-to-r from-pink-400 to-purple-400 text-white"
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

      <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 flex gap-1.5 sm:gap-2">
        <IconButton onClick={onRotate} label="Rotate photo clockwise" light={light}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
            <path d="M21 12a9 9 0 1 1-3.2-6.9" />
            <path d="M21 3v6h-6" />
          </svg>
        </IconButton>
        <IconButton onClick={onShare} label="Share photo" light={light}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}

function PhotoMaxView({ photo, onClose }: { photo: Photo; onClose: () => void }) {
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

export async function sharePhoto(photo: Photo) {
  try {
    const res = await fetch(photo.src);
    const blob = await res.blob();
    const file = new File([blob], photo.name, { type: blob.type });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return;
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    console.error("Share failed:", err);
  }
  window.open(photo.src, "_blank");
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

export default function LifeTimeRandomSlides({
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
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  cardDragStyle,
  likeOpacity,
  dislikeOpacity,
  selectedIds,
  onToggleSelectPhoto,
  masonryCols,
}: LifeTimeRandomSlidesProps) {
  const rawCols = Math.ceil(Math.sqrt(photos.length || 1));
  const cols = isNarrow ? Math.min(rawCols, 2) : photos.length > 0 && photos.length <= 3 ? photos.length : rawCols;
  const currentPhoto = photos[currentIndex];

  return (
    <>
      <div className="relative mt-4 w-full sm:mt-4">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 py-10">
            <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0s" }}></span>
            <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.2s" }}></span>
            <span className="h-2.5 w-2.5 rounded-full bg-pink-300 animate-dot-pulse" style={{ animationDelay: "0.4s" }}></span>
          </div>
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
                onShare={() => sharePhoto(currentPhoto)}
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
        ) : !pinterestMode && photos.length <= 3 ? (
          <div
            className={`mx-auto grid w-full max-w-6xl gap-3 sm:gap-4 transition-opacity duration-300 ${loading ? "opacity-30" : "opacity-100"}`}
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
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
                onShare={() => sharePhoto(photo)}
                onSelect={() => setSelectedPhoto(photo)}
                className="aspect-[4/5] w-full animate-zoom-out-in"
                style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "backwards" }}
              />
            ))}
          </div>
        ) : (
          <div
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
                onShare={() => sharePhoto(photo)}
                onSelect={() => setSelectedPhoto(photo)}
                className="mb-3 w-full break-inside-avoid animate-zoom-out-in"
                style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "backwards" }}
              />
            ))}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <PhotoMaxView photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </>
  );
}
