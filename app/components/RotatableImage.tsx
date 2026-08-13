type RotatableImageProps = {
  src: string;
  rotate?: boolean;
  className?: string;
};

export default function RotatableImage({ src, rotate, className }: RotatableImageProps) {
  if (!rotate) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={className} />;
  }

  const safeClassName = (className ?? "").replace(/\bobject-(cover|contain|fill|none|scale-down)\b/g, "").trim();

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ containerType: "size" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={`absolute top-1/2 left-1/2 object-contain ${safeClassName}`}
        style={{ width: "100cqh", height: "100cqw", transform: "translate(-50%, -50%) rotate(-90deg)" }}
      />
    </div>
  );
}
