"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useCallback } from "react";
import type { Lang, Photo } from "@/lib/types";

export function Gallery({ photos, lang }: { photos: Photo[]; lang: Lang }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, prev, next]);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((p, i) => (
          <button
            key={p.src + i}
            onClick={() => setActive(i)}
            className="aspect-[4/3] overflow-hidden border border-border"
            aria-label={p.caption[lang]}
          >
            <img
              src={p.src}
              alt={p.caption[lang]}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={close}
            className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          {photos.length > 1 && (
            <>
              <NavBtn side="left" onClick={(e) => { e.stopPropagation(); prev(); }} />
              <NavBtn side="right" onClick={(e) => { e.stopPropagation(); next(); }} />
            </>
          )}
          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[active].src}
              alt={photos[active].caption[lang]}
              className="max-h-[80vh] w-auto object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-white/80">
              {photos[active].caption[lang]}
              {photos[active].date && <span className="ml-2 text-white/50">{photos[active].date}</span>}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

function NavBtn({ side, onClick }: { side: "left" | "right"; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:text-white ${
        side === "left" ? "left-4" : "right-4"
      }`}
      aria-label={side === "left" ? "Previous" : "Next"}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {side === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
      </svg>
    </button>
  );
}
