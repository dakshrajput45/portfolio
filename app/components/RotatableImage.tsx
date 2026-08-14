import { isVideoSrc } from "../lib/proxiedSrc";

type RotatableImageProps = {
  src: string;
  rotate?: boolean;
  className?: string;
};

export default function RotatableImage({ src, rotate, className }: RotatableImageProps) {
  const isVideo = isVideoSrc(src);

  if (!rotate) {
    return isVideo ? (
      <video src={src} autoPlay muted loop playsInline className={className} />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className={className} />
    );
  }

  const safeClassName = (className ?? "").replace(/\bobject-(cover|contain|fill|none|scale-down)\b/g, "").trim();
  const rotatedStyle = {
    width: "100cqh",
    height: "100cqw",
    transform: "translate(-50%, -50%) rotate(-90deg)",
  } as const;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ containerType: "size" }}>
      {isVideo ? (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute top-1/2 left-1/2 object-contain ${safeClassName}`}
          style={rotatedStyle}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className={`absolute top-1/2 left-1/2 object-contain ${safeClassName}`}
          style={rotatedStyle}
        />
      )}
    </div>
  );
}
