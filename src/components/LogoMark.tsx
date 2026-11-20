/** 로고 마크 — 인체 단면 고리 3개를 쌓은 모양. 색은 글자색(currentColor)을 따라갑니다. */
export function LogoMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
      className={className}
    >
      <ellipse cx="12" cy="5.5" rx="5" ry="2" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.2" />
      <ellipse cx="12" cy="18.5" rx="6.5" ry="2.3" />
    </svg>
  );
}
