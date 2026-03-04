import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

function ImageTile({ src, alt, className = "", title }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-bg-subtle text-sm text-text-muted ${className}`}>
        {title || "Image"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full rounded-lg object-cover ${className}`}
      loading="lazy"
    />
  );
}

export default function ServiceGallery({
  images = [],
  totalCount,
  className = "",
}) {
  const uniqueImages = useMemo(() => [...new Set((images || []).filter(Boolean))], [images]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const previewSlots = 6;
  const thumbnailCount = 4;
  const firstThumbnailIndex = 1;
  const overlayIndex = firstThumbnailIndex + thumbnailCount;
  const fallback = uniqueImages[0] || "";
  const safeTotalCount = Number.isFinite(Number(totalCount))
    ? Math.max(Number(totalCount), uniqueImages.length)
    : uniqueImages.length;
  const extraCount = Math.max(0, safeTotalCount - previewSlots);

  const heroImage = uniqueImages[0] || fallback;
  const bottomImages = Array.from({ length: thumbnailCount }, (_, index) => ({
    src: uniqueImages[index + firstThumbnailIndex] || fallback,
    imageIndex: Math.min(index + firstThumbnailIndex, Math.max(uniqueImages.length - 1, 0)),
  }));
  const overlayImage = uniqueImages[Math.min(overlayIndex, Math.max(uniqueImages.length - 1, 0))] || fallback;
  const maxIndex = Math.max(uniqueImages.length - 1, 0);
  const currentImage = uniqueImages[Math.min(activeIndex, maxIndex)] || fallback;

  useEffect(() => {
    if (!isPreviewOpen) return undefined;

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
        return;
      }

      if (!uniqueImages.length) return;
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % uniqueImages.length);
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
      }
    };

    document.addEventListener("keydown", handleKeydown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isPreviewOpen, uniqueImages.length]);

  const openPreview = (index) => {
    if (!uniqueImages.length) return;
    const safeIndex = Math.min(Math.max(index, 0), maxIndex);
    setActiveIndex(safeIndex);
    setIsPreviewOpen(true);
  };

  const showNext = () => {
    if (!uniqueImages.length) return;
    setActiveIndex((prev) => (prev + 1) % uniqueImages.length);
  };

  const showPrev = () => {
    if (!uniqueImages.length) return;
    setActiveIndex((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
  };

  return (
    <>
      <section className={`overflow-hidden rounded-xl border border-border bg-bg-surface p-3 shadow-1 sm:p-4 ${className}`}>
        <button
          type="button"
          className="h-52 w-full cursor-grab rounded-lg active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:h-64 md:h-[28rem]"
          onClick={() => openPreview(0)}
          aria-label="Open main gallery image"
        >
          <ImageTile src={heroImage} alt="Gallery main" className="h-full w-full" />
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {bottomImages.map((image, index) => (
            <button
              key={`gallery-bottom-${index}`}
              type="button"
              className="h-24 cursor-grab active:cursor-grabbing rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:h-28"
              onClick={() => openPreview(image.imageIndex)}
              aria-label={`Open gallery thumbnail ${index + 1}`}
            >
              <ImageTile src={image.src} alt={`Gallery thumbnail ${index + 1}`} />
            </button>
          ))}

          <button
            type="button"
            className="relative h-24 cursor-grab active:cursor-grabbing rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:h-28"
            onClick={() => openPreview(overlayIndex)}
            aria-label={extraCount > 0
              ? `Open more photos, plus ${extraCount}`
              : "Open gallery thumbnail 5"}
          >
            <ImageTile src={overlayImage} alt="Gallery more photos" />
            {extraCount > 0 ? (
              <>
                <div className="absolute inset-0 rounded-lg bg-black/50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <p className="text-2xl font-semibold">{`+${extraCount}`}</p>
                  <p className="text-sm font-semibold">photos</p>
                </div>
              </>
            ) : null}
          </button>
        </div>
      </section>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery preview"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-xl border border-white/20 bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={`Gallery preview ${activeIndex + 1}`}
              className="max-h-[80vh] w-full object-contain"
            />

            <button
              type="button"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>

            {uniqueImages.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
                  onClick={showPrev}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
                  onClick={showNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-pill bg-black/65 px-3 py-1 text-sm font-semibold text-white">
              {`${Math.min(activeIndex + 1, uniqueImages.length)} / ${uniqueImages.length || 1}`}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
