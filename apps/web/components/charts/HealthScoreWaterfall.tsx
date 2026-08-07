"use client";

import React, { useMemo } from "react";
import type { ScorePenalty } from "@/lib/reporting/scorePenalties";
import { buildWaterfallSteps, type WaterfallStep } from "@/lib/reporting/waterfall";

interface HealthScoreWaterfallProps {
  score: number;
  penalties: ScorePenalty[];
  isPrintMode?: boolean;
}

export default function HealthScoreWaterfall({ score, penalties, isPrintMode = false }: HealthScoreWaterfallProps) {
  const steps = useMemo(
    () => buildWaterfallSteps(score, penalties) as WaterfallStep[],
    [score, penalties]
  );

  const svgHeight = 240;
  const svgWidth = 500;
  const paddingLeft = 130;
  const paddingRight = 40;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const rowHeight = (svgHeight - 20) / steps.length;

  const scaleValue = (val: number) => (val / 100) * chartWidth;

  return (
    <div className={`w-full ${isPrintMode ? "" : "glass-card p-5 bg-surface/30 border border-border-subtle rounded-2xl"} flex flex-col`}>
      {!isPrintMode && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Decomposição do Health Score (Waterfall)</h4>
          <span className="text-[11px] text-text-muted">Deduções acumuladas sobre a qualidade (fonte: motor de pontuação do backend)</span>
        </div>
      )}

      <div className="flex-1 min-h-[220px] flex items-center justify-center">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible font-sans">
          {/* Vertical Gridlines */}
          {[0, 25, 50, 75, 100].map((gridVal) => {
            const x = paddingLeft + scaleValue(gridVal);
            return (
              <g key={gridVal}>
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={svgHeight - 15}
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={x}
                  y={svgHeight - 3}
                  fontSize="7.5"
                  fill="#71717a"
                  textAnchor="middle"
                  className="font-mono"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {steps.map((step, idx) => {
            const y = idx * rowHeight + 2;
            const barHeight = rowHeight - 6;

            let x = paddingLeft;
            let barWidth = 0;
            let fill = "#8ab4ff";

            if (step.type === "start") {
              barWidth = scaleValue(100);
              fill = "rgba(138, 180, 255, 0.45)";
            } else if (step.type === "end") {
              barWidth = scaleValue(score);
              fill = score >= 85 ? "rgba(126, 231, 135, 0.5)" : score >= 70 ? "rgba(242, 204, 96, 0.45)" : "rgba(255, 123, 114, 0.45)";
            } else if (step.type === "rounding") {
              // Transparent rounding residual — surfaced as its own muted step,
              // never folded silently into a penalty.
              const prevValue = steps[idx - 1].value;
              const currentVal = step.change;
              x = paddingLeft + scaleValue(prevValue + currentVal);
              barWidth = Math.max(1.5, scaleValue(Math.abs(currentVal)));
              fill = "rgba(148, 163, 184, 0.55)"; // muted slate
            } else {
              const prevValue = steps[idx - 1].value;
              const currentVal = step.change;

              if (currentVal === 0) {
                x = paddingLeft + scaleValue(prevValue);
                barWidth = 2;
                fill = "#71717a";
              } else {
                x = paddingLeft + scaleValue(prevValue + currentVal);
                barWidth = scaleValue(Math.abs(currentVal));
                const absVal = Math.abs(currentVal);
                if (absVal >= 10) {
                  fill = "rgba(239, 68, 68, 0.5)";
                } else if (absVal >= 5) {
                  fill = "rgba(242, 204, 96, 0.5)";
                } else {
                  fill = "rgba(239, 68, 68, 0.3)";
                }
              }
            }

            return (
              <g key={idx} className="group">
                <text
                  x={paddingLeft - 8}
                  y={y + barHeight / 2 + 3}
                  fontSize="8.5"
                  fill={step.type === "end" ? "#ffffff" : step.type === "rounding" ? "#94a3b8" : "#a1a1aa"}
                  fontWeight={step.type === "end" ? "bold" : "normal"}
                  textAnchor="end"
                >
                  {step.label}
                </text>

                <rect
                  x={x}
                  y={y}
                  width={Math.max(1.5, barWidth)}
                  height={barHeight}
                  fill={fill}
                  rx="1.5"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="0.5"
                  className="transition-all duration-300 hover:fill-opacity-130"
                />

                <text
                  x={(step.type === "penalty" || step.type === "rounding") && step.change !== 0 ? x - 4 : x + barWidth + 4}
                  y={y + barHeight / 2 + 3}
                  fontSize="8"
                  fill={step.type === "rounding" ? "#94a3b8" : step.type === "penalty" && step.change !== 0 ? "#ff7b72" : step.type === "end" ? "#7ee787" : "#ffffff"}
                  fontWeight={step.type === "end" ? "bold" : "normal"}
                  textAnchor={(step.type === "penalty" || step.type === "rounding") && step.change !== 0 ? "end" : "start"}
                  className="font-mono"
                >
                  {step.type === "start"
                    ? "100"
                    : step.type === "end"
                    ? `${score}`
                    : step.change === 0
                    ? "0"
                    : `${step.change > 0 ? "+" : ""}${step.change}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
