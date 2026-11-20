/** 페이지 제목만 — 설명 문구는 두지 않습니다. */
export function PageHeader({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-8 lg:px-12 lg:pt-20 lg:pb-12">
      <h1 className="rise rise-1 font-serif text-[40px] leading-tight font-normal tracking-[-0.02em] lg:text-[56px]">
        {title}
      </h1>
    </div>
  );
}
