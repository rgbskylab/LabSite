/** 페이지 제목만 — 설명 문구는 두지 않습니다. */
export function PageHeader({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-14 pb-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
    </div>
  );
}
