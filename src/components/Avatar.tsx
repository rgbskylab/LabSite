/* eslint-disable @next/next/no-img-element */
import type { Lang } from "@/lib/types";

/**
 * 인물 사진. 사진이 없으면 이니셜 박스.
 *  - shape="portrait": 그리드용 세로 3:4 (연구실 홈페이지 표준)
 *  - shape="square": 목록용 정사각 썸네일
 */
export function Avatar({
  name,
  photo,
  lang,
  shape = "portrait",
  size = 72,
}: {
  name: { ko: string; en: string };
  photo?: string;
  lang: Lang;
  shape?: "portrait" | "square";
  size?: number;
}) {
  const display = name[lang] || name.en || name.ko;
  const initials = getInitials(name.en || name.ko);
  const portrait = shape === "portrait";
  const box = portrait ? "aspect-[3/4] w-full" : "";
  const style = portrait ? undefined : { width: size, height: size };

  if (photo) {
    return (
      <img
        src={photo}
        alt={display}
        className={`${box} bg-[color:var(--border)] object-cover`}
        style={style}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${box} flex items-center justify-center border border-border text-muted`}
      style={style ? { ...style, fontSize: size * 0.32 } : undefined}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
