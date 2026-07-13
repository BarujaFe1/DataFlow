"use client";

import { DEMO_CASE_SNAPSHOT } from "@/lib/demoSnapshot";

interface DemoMetricsStripProps {
  /** When true, show a small “snapshot” caption (landing / offline). */
  showSourceHint?: boolean;
  className?: string;
}

/**
 * Portfolio / landing metrics strip.
 * Always shows verified demo case numbers — never empty or zero placeholders.
 */
export default function DemoMetricsStrip({
  showSourceHint = true,
  className = "",
}: DemoMetricsStripProps) {
  const m = DEMO_CASE_SNAPSHOT.metrics;

  const items = [
    { label: "Health Score", value: String(m.healthScore), suffix: "/100" },
    { label: "Ingeridos", value: String(m.rowsIngested), suffix: "" },
    { label: "Válidos", value: String(m.rowsValid), suffix: "" },
    { label: "Duplicatas", value: String(m.duplicateCount), suffix: "" },
    { label: "Colunas", value: String(m.columnsMapped), suffix: "" },
  ];

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border-subtle bg-surface-elevated/40 px-3 py-3 text-left"
          >
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold block">
              {item.label}
            </span>
            <span className="text-xl font-bold text-text-primary font-mono tabular-nums">
              {item.value}
              {item.suffix ? (
                <span className="text-sm text-text-muted font-medium">{item.suffix}</span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
      {showSourceHint ? (
        <p className="text-[10px] text-text-muted mt-2 font-mono text-center sm:text-left">
          Case demo verificado ({DEMO_CASE_SNAPSHOT.verifiedAt}) · snapshot estático coerente com o
          pipeline — não depende da API estar quente.
        </p>
      ) : null}
    </div>
  );
}
