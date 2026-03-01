"use client";

import { useCountUp } from "@/lib/hooks/use-count-up";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
}

function StatItem({ value, suffix, label }: StatItemProps) {
  const { count, ref } = useCountUp(value, 2000);

  return (
    <div className="text-center relative py-8">
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-1/4 right-1/4 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(16,185,129,0.3), transparent)",
        }}
      />
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2 font-mono tabular-nums"
      >
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-[#64748B] text-sm">{label}</div>
    </div>
  );
}

const stats = [
  { value: 2500, suffix: "+", label: "Players Ativos" },
  { value: 15, suffix: "M+", label: "Horas Monitoradas" },
  { value: 99, suffix: ".9%", label: "Uptime" },
  { value: 4, suffix: ".9/5", label: "Avaliação" },
];

export function Stats() {
  return (
    <section className="relative py-24">
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-6 pt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      <div className="section-divider mt-24" />
    </section>
  );
}
