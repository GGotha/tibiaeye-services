export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
      {children}
    </h2>
  );
}
