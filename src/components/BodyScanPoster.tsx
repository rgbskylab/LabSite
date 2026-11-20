import { BODY_RINGS, MEASURE_RINGS } from "@/lib/body-rings";

/** 높이 눈금 (y 좌표). 170cm 를 30~610 사이에 34.1 간격으로 나눈 값 */
const TICKS = [610, 575.9, 541.8, 507.6, 473.5, 439.4, 405.3, 371.2, 337, 302.9, 268.8, 234.7, 200.6, 166.5, 132.4, 98.2, 64.1, 30];
const MAJOR = new Set([610, 439.4, 268.8, 98.2, 30]);

const LINE = "#53647F";
const RING = "#E4EAF1";
const HIGHLIGHT = "#8DB4DA";
const LABEL = "#AEB8C7";
const VALUE = "#F4F2EC";

/**
 * 홈 영상 자리의 썸네일 — 기본 체형의 단면 고리 와이어프레임.
 * 남색 배경 위에 그리며, 둘레 고리가 그려지고 스캔 선이 아래에서 위로 훑습니다.
 * 계측 라벨은 넓은 화면(sm 이상)에서만 보입니다.
 */
export function BodyScanPoster({
  labels,
  className = "",
}: {
  labels: { height: string; chest: string; waist: string; hip: string };
  className?: string;
}) {
  return (
    <svg viewBox="0 0 560 640" aria-hidden className={`overflow-visible ${className}`}>
      <g className="fade-in" fill="none" stroke={LINE} strokeWidth="1">
        <line x1="18" y1="30" x2="18" y2="610" />
        {TICKS.map((y) => (
          <line key={y} x1="18" y1={y} x2={MAJOR.has(y) ? 32 : 26} y2={y} />
        ))}
        <ellipse cx="210" cy="610" rx="118" ry="15" strokeDasharray="3 5" />
      </g>
      <g className="fade-in" fill="none" stroke={RING} strokeWidth="1" opacity="0.34">
        {BODY_RINGS.map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} />
        ))}
      </g>
      <g fill="none" stroke={HIGHLIGHT} strokeWidth="2.2">
        {MEASURE_RINGS.map(({ key, ring: [cx, cy, rx, ry] }, i) => (
          <ellipse
            key={key}
            className="draw"
            style={{ animationDelay: `${0.9 + i * 0.25}s` }}
            pathLength={100}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
          />
        ))}
      </g>
      <g className="fade-in hidden sm:inline" stroke={HIGHLIGHT} strokeWidth="1">
        {MEASURE_RINGS.map(({ key, ring: [cx, cy, rx] }) => (
          <line key={key} x1={cx + rx} y1={cy} x2="398" y2={cy} />
        ))}
      </g>
      <g fill={HIGHLIGHT}>
        {MEASURE_RINGS.map(({ key, ring: [cx, cy, rx] }) => (
          <circle key={key} className="pulse-soft" cx={cx + rx} cy={cy} r="3.5" />
        ))}
      </g>
      <g className="scanline">
        <rect x="36" y="586" width="348" height="24" fill={HIGHLIGHT} opacity="0.14" />
        <line x1="36" y1="610" x2="384" y2="610" stroke={HIGHLIGHT} strokeWidth="1.5" />
      </g>
      <g className="fade-in hidden sm:inline" fontSize="14">
        {MEASURE_RINGS.map(({ key, ring: [, cy], value }) => (
          <g key={key}>
            <text x="406" y={cy - 5} fill={LABEL}>
              {labels[key]}
            </text>
            <text x="406" y={cy + 15} fill={VALUE} fontSize="17">
              {value} cm
            </text>
          </g>
        ))}
        <text x="40" y="24" fill={LABEL}>
          {labels.height}
          <tspan dx="8" fill={VALUE} fontSize="17">
            170 cm
          </tspan>
        </text>
      </g>
    </svg>
  );
}
