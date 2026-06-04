"use client";

import React, { useMemo } from "react";
import { Info } from "lucide-react";

interface FunnelStage {
  stage: string;
  count: number;
}

interface RecruitmentFunnelProps {
  funnelData: FunnelStage[];
  totalCandidates: number;
}

// Logical sorting of recruitment stages
const STAGE_ORDER: Record<string, number> = {
  "cadastro": 1,
  "ingestão": 1,
  "triagem": 2,
  "teste": 3,
  "teste técnico": 3,
  "entrevista": 4,
  "aprovado": 5,
  "contratado": 5
};

export default function RecruitmentFunnel({ funnelData, totalCandidates }: RecruitmentFunnelProps) {
  const sortedStages = useMemo(() => {
    return [...funnelData].sort((a, b) => {
      const orderA = STAGE_ORDER[a.stage.toLowerCase()] || 99;
      const orderB = STAGE_ORDER[b.stage.toLowerCase()] || 99;
      return orderA - orderB;
    });
  }, [funnelData]);

  // Compute widths and drop-offs
  const stagesWithMetrics = useMemo(() => {
    let maxVal = totalCandidates || 300;
    if (sortedStages.length > 0 && sortedStages[0].count > maxVal) {
      maxVal = sortedStages[0].count;
    }
    
    return sortedStages.map((stage, idx) => {
      const pctOfTotal = maxVal > 0 ? (stage.count / maxVal) * 100 : 0;
      
      let dropOff = 0;
      if (idx > 0) {
        const prevCount = sortedStages[idx - 1].count;
        if (prevCount > 0) {
          dropOff = ((prevCount - stage.count) / prevCount) * 100;
        }
      }

      return {
        ...stage,
        pctOfTotal,
        dropOff
      };
    });
  }, [sortedStages, totalCandidates]);

  // Define SVG dimensions
  const svgHeight = 280;
  const svgWidth = 400;
  const rowHeight = svgHeight / Math.max(1, stagesWithMetrics.length);

  // Generate SVG polygon coordinates for a funnel
  const funnelPolygons = useMemo(() => {
    const polys: Array<{ points: string; fill: string; stage: string; count: number; pct: number; drop: number }> = [];
    const n = stagesWithMetrics.length;
    
    for (let i = 0; i < n; i++) {
      const current = stagesWithMetrics[i];
      const next = stagesWithMetrics[i + 1];

      // Top width based on current count
      const topWidth = (current.count / (totalCandidates || 300)) * 260 + 40; // min width 40, max 300
      // Bottom width based on next count (or a tapered reduction if last stage)
      const bottomWidth = next 
        ? (next.count / (totalCandidates || 300)) * 260 + 40 
        : topWidth * 0.7;

      const yTop = i * rowHeight;
      const yBottom = (i + 1) * rowHeight - 4; // 4px spacing between stages

      const xTopLeft = (svgWidth - topWidth) / 2;
      const xTopRight = xTopLeft + topWidth;
      const xBottomLeft = (svgWidth - bottomWidth) / 2;
      const xBottomRight = xBottomLeft + bottomWidth;

      // Color coding per stage
      let fill = "rgba(138, 180, 255, 0.25)";
      if (current.stage.includes("Aprovado")) {
        fill = "rgba(126, 231, 135, 0.25)"; // green
      } else if (current.stage.includes("Reprovado")) {
        fill = "rgba(239, 68, 68, 0.2)"; // red
      } else if (current.stage.includes("Entrevista")) {
        fill = "rgba(138, 180, 255, 0.35)"; // darker blue
      } else if (current.stage.includes("Triagem")) {
        fill = "rgba(138, 180, 255, 0.15)"; // lighter blue
      }

      polys.push({
        points: `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`,
        fill,
        stage: current.stage,
        count: current.count,
        pct: current.pctOfTotal,
        drop: current.dropOff
      });
    }

    return polys;
  }, [stagesWithMetrics, totalCandidates, rowHeight]);

  return (
    <div className="glass-card p-6 flex flex-col h-[380px] bg-surface/30 border border-border-subtle rounded-2xl w-full">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-text-primary">Funil Operacional de Recrutamento</h4>
        <span className="text-xs text-text-muted">Distribuição e drop-off de candidatos pelas fases</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-0">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full max-h-[220px] overflow-visible">
          {funnelPolygons.map((poly, idx) => (
            <g key={idx} className="group cursor-default">
              {/* Funnel Segment */}
              <polygon
                points={poly.points}
                fill={poly.fill}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1.5"
                className="transition duration-300 hover:fill-opacity-140 hover:stroke-accent/40"
              />
              
              {/* Text label in the center */}
              <text
                x={svgWidth / 2}
                y={idx * rowHeight + rowHeight / 2 - 1}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#ffffff"
                className="pointer-events-none"
              >
                {poly.stage}: {poly.count} ({poly.pct.toFixed(0)}%)
              </text>

              {/* Drop-off overlay label on the right side if idx > 0 */}
              {idx > 0 && poly.drop > 0 && (
                <text
                  x={svgWidth - 5}
                  y={idx * rowHeight + 2}
                  textAnchor="end"
                  fontSize="8"
                  fill="#ff7b72"
                  fontWeight="bold"
                  className="font-mono pointer-events-none"
                >
                  ↓ {poly.drop.toFixed(0)}% drop
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 p-2 bg-surface border border-border-subtle rounded flex items-start space-x-2 text-[10px] leading-relaxed text-text-secondary">
        <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
        <span>
          <strong>Representação de Status:</strong> Distribuição atual por etapa de cada candidato no dataset sintético demo, não jornada longitudinal do mesmo candidato.
        </span>
      </div>
    </div>
  );
}
