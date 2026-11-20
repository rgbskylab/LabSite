/**
 * 새 탭으로 열리는 링크 끝에 붙이는 표시.
 *  - 화면에는 ↗ 만 보이고 (스크린리더는 읽지 않음)
 *  - 스크린리더에는 "(새 탭에서 열림)" 같은 안내만 읽힙니다 (화면에는 안 보임)
 * arrow={false} 면 ↗ 없이 안내 문구만 붙입니다.
 */
export function ExternalMark({
  label,
  arrow = true,
}: {
  label: string;
  arrow?: boolean;
}) {
  return (
    <>
      {arrow && <span aria-hidden> ↗</span>}
      <span className="sr-only"> {label}</span>
    </>
  );
}
