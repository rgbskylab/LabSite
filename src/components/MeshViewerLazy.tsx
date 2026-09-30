"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { getDict } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const MeshViewer = dynamic(() => import("./MeshViewer"), { ssr: false });

/**
 * 3D 뷰어는 three.js(수백 KB)를 쓰므로 화면에 들어올 때까지 내려받지 않습니다.
 */
export function MeshViewerLazy({ src, lang }: { src?: string; lang: Lang }) {
  const t = getDict(lang).viewer;
  const ref = useRef<HTMLDivElement>(null);
  // IntersectionObserver 가 없는 환경에서는 처음부터 바로 보여줍니다
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <MeshViewer src={src} lang={lang} />
      ) : (
        <div className="flex h-[360px] items-center justify-center border border-border text-sm text-muted sm:h-[460px]">
          {t.loading}
        </div>
      )}
    </div>
  );
}
