"use client";

import { useState } from "react";
import type { HomeVideo as HomeVideoConfig } from "@/lib/types";
import { BodyScanPoster } from "./BodyScanPoster";
import { LogoMark } from "./LogoMark";

/** YouTube 주소(youtu.be/…, watch?v=…, /embed/…, /shorts/…) 또는 ID 에서 영상 ID 만 뽑습니다. */
function youtubeId(v: string): string | undefined {
  const s = v.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m?.[1];
}

/** 재생 버튼이 사라지고 플레이어가 생길 때, 키보드 포커스를 플레이어로 옮김 */
function focusOnMount(el: HTMLElement | null) {
  el?.focus();
}

const POSTER_BG = "radial-gradient(90% 120% at 72% 45%, #24375C 0%, #17233A 62%)";

/**
 * 홈 영상 블록.
 *  - site.yml 의 video.youtube 나 video.src 가 있으면: 썸네일 + "영상 재생" 버튼 → 누르면 그 자리에서 재생
 *  - 없으면: 움직이는 인체 단면 그림만 보입니다(장식)
 */
export function HomeVideo({
  video,
  title,
  siteName,
  labels,
}: {
  video?: HomeVideoConfig;
  title?: string;
  siteName: string;
  labels: {
    video: string;
    play: string;
    fields: { height: string; chest: string; waist: string; hip: string };
  };
}) {
  const [playing, setPlaying] = useState(false);
  const yt = video?.youtube ? youtubeId(video.youtube) : undefined;
  const src = video?.src;
  const playable = Boolean(yt || src);
  const caption = title || labels.video;

  return (
    <figure className="rise rise-5 m-0">
      <div
        className="relative aspect-video overflow-hidden rounded-[20px] text-[#F4F2EC] sm:rounded-[28px]"
        style={{ background: POSTER_BG }}
      >
        {playing && yt ? (
          <iframe
            ref={focusOnMount}
            src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&playsinline=1`}
            title={caption}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : playing && src ? (
          <video
            ref={focusOnMount}
            src={src}
            poster={video?.poster}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 size-full bg-black object-contain"
          />
        ) : (
          <>
            {playable && video?.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.poster} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <BodyScanPoster
                labels={labels.fields}
                className="absolute top-[7%] right-[9%] aspect-[560/640] h-[86%] w-auto sm:top-[5%] sm:right-[8%] sm:h-[90%]"
              />
            )}

            <span
              aria-hidden
              className="absolute top-[clamp(24px,3vw,40px)] left-[clamp(24px,4vw,56px)] hidden items-center gap-2 font-serif text-[17px] font-medium sm:flex"
            >
              <LogoMark size={20} />
              {siteName}
            </span>

            {playable && (
              <div className="absolute bottom-3.5 left-3.5 flex flex-col items-start gap-[18px] sm:bottom-[clamp(24px,4vw,56px)] sm:left-[clamp(24px,4vw,56px)] sm:max-w-[42%]">
                <span className="hidden text-sm text-[#AEB8C7] sm:block" aria-hidden>
                  {labels.video}
                </span>
                <span
                  className="hidden font-serif text-[clamp(26px,2.8vw,40px)] leading-[1.3] tracking-[-0.015em] sm:block"
                  aria-hidden
                >
                  {caption}
                </span>
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="halo inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-full bg-[#F4F2EC] py-0 pr-[18px] pl-1.5 text-sm font-medium text-[#17233A] transition-[scale,background-color] duration-300 hover:scale-[1.04] hover:bg-white motion-reduce:transition-none motion-reduce:hover:scale-100 sm:min-h-14 sm:gap-3 sm:pr-[26px] sm:pl-2 sm:text-base"
                >
                  <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-[#17233A] sm:size-10">
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <path d="M4 2v10l8.5-5z" fill="#F4F2EC" />
                    </svg>
                  </span>
                  {labels.play}
                  <span className="sr-only">: {caption}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {playable && (
        <figcaption className="mt-3 flex justify-between gap-3 px-1 text-sm sm:sr-only">
          <span className="font-medium">{caption}</span>
          <span className="text-muted">{siteName}</span>
        </figcaption>
      )}
    </figure>
  );
}
