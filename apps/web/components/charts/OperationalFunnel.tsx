"use client";

import React, { useMemo, useState } from "react";
import { Info } from "lucide-react";

interface FunnelStage {
  stage: string;
  count: number;
}

interface OperationalFunnelProps {
  funnelData: FunnelStage[];
  totalCandidates: number;
}

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

export default function OperationalFunnel({ funnelData, totalCandidates }: OperationalFunnelProps) {
  const [hoveredStage, setHoveredStage] = useState<{
    stage: string;
    count: number;
    pct: number;
    drop: number;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const sortedStages = useMemo(() => {
    return [...funnelData].sort((a, b) => {
      const orderA = STAGE_ORDER[a.stage.toLowerCase()] || 99;
      const orderB = STAGE_ORDER[b.stage.toLowerCase()] || 99;
      return orderA - orderB;
    });
  }, [funnelData]);

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

  const svgHeight = 280;
  const svgWidth = 400;
  const rowHeight = svgHeight / Math.max(1, stagesWithMetrics.length);

  const funnelPolygons = useMemo(() => {
    const polys: Array<{
      points: string;
      fill: string;
      hoverFill: string;
      stage: string;
      count: number;
      pct: number;
      drop: number;
    }> = [];
    const n = stagesWithMetrics.length;
    
    for (let i = 0; i < n; i++) {
      const current = stagesWithMetrics[i];
      const next = stagesWithMetrics[i + 1];

      const topWidth = (current.count / (totalCandidates || 300)) * 260 + 40;
      const bottomWidth = next 
        ? (next.count / (totalCandidates || 300)) * 260 + 40 
        : topWidth * 0.7;

      const yTop = i * rowHeight;
      const yBottom = (i + 1) * rowHeight - 6;

      const xTopLeft = (svgWidth - topWidth) / 2;
      const xTopRight = xTopLeft + topWidth;
      const xBottomLeft = (svgWidth - bottomWidth) / 2;
      const xBottomRight = xBottomLeft + bottomWidth;

      let fill = "rgba(59, 130, 246, 0.2)";
      let hoverFill = "rgba(59, 130, 246, 0.35)";
      
      const stName = current.stage.toLowerCase();
      if (stName.includes("aprovado") || stName.includes("contratado")) {
        fill = "rgba(34, 197, 94, 0.2)";
        hoverFill = "rgba(34, 197, 94, 0.35)";
      } else if (stName.includes("reprovado")) {
        fill = "rgba(239, 68, 68, 0.15)";
        hoverFill = "rgba(239, 68, 68, 0.3)";
      } else if (stName.includes("entrevista")) {
        fill = "rgba(139, 92, 246, 0.2)";
        hoverFill = "rgba(139, 92, 246, 0.35)";
      } else if (stName.includes("teste")) {
        fill = "rgba(34, 211, 238, 0.2)";
        hoverFill = "rgba(34, 211, 238, 0.35)";
      }

      polys.push({
        points: `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`,
        fill,
        hoverFill,
        stage: current.stage,
        count: current.count,
        pct: current.pctOfTotal,
        drop: current.dropOff
      });
    }

    return polys;
  }, [stagesWithMetrics, totalCandidates, rowHeight]);

  const handleMouseMove = (
    e: React.MouseEvent,
    poly: {
      stage: string;
      count: number;
      pct: number;
      drop: number;
    }
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + 15;
    const y = e.clientY - rect.top - 10;
    
    setTooltipPos({ x, y });
    setHoveredStage(poly);
  };

  return (
    <div className="glass-card p-6 flex flex-col h-[380px] bg-surface/30 border border-border-subtle rounded-2xl w-full relative">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-text-primary">Funil Operacional de Recrutamento</h4>
        <span className="text-xs text-text-muted">Distribuição estática e perdas (drop-off) por etapa</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-0">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full max-h-[220px] overflow-visible relative"
        >
          {funnelPolygons.map((poly, idx) => {
            const isHovered = hoveredStage?.stage === poly.stage;
            return (
              <g 
                key={idx} 
                className="group cursor-help"
                onMouseMove={(e) => handleMouseMove(e, poly)}
                onMouseLeave={() => setHoveredStage(null)}
              >
                {/* Funnel Segment */}
                <polygon
                  points={poly.points}
                  fill={isHovered ? poly.hoverFill : poly.fill}
                  stroke={isHovered ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.06)"}
                  strokeWidth="1.5"
                  className="transition duration-200"
                />
                
                {/* Stage Text Label */}
                <text
                  x={svgWidth / 2}
                  y={idx * rowHeight + rowHeight / 2 - 2}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fill="#F8FAFC"
                  className="pointer-events-none tracking-wide select-none drop-shadow-sm"
                >
                  {poly.stage.toUpperCase()}: {poly.count}
                </text>

                {/* Drop-off Badge */}
                {idx > 0 && poly.drop > 0 && (
                  <g className="pointer-events-none select-none">
                    <rect
                      x={svgWidth - 62}
                      y={idx * rowHeight - 4}
                      width="58"
                      height="14"
                      rx="3"
                      fill="rgba(239, 68, 68, 0.15)"
                      stroke="rgba(239, 68, 68, 0.25)"
                      strokeWidth="0.8"
                    />
                    <text
                      x={svgWidth - 33}
                      y={idx * rowHeight + 6}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#EF4444"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      -{poly.drop.toFixed(0)}% drop
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Custom absolute hover tooltip within the card container */}
        {hoveredStage && (
          <div 
            className="absolute bg-surface-elevated border border-border-subtle p-3 rounded-lg shadow-xl text-xs font-sans flex flex-col gap-1 z-35 pointer-events-none transition-all duration-75"
            style={{ 
              left: `${tooltipPos.x}px`, 
              top: `${tooltipPos.y}px` 
            }}
          >
            <p className="font-extrabold text-text-primary border-b border-border-subtle pb-1 mb-1 uppercase tracking-wide text-[10px]">
              {hoveredStage.stage}
            </p>
            <p className="flex justify-between gap-6 text-text-secondary">
              <span>Volume na Etapa:</span>
              <span className="font-mono font-bold text-text-primary">{hoveredStage.count} candidatos</span>
            </p>
            <p className="flex justify-between gap-6 text-text-secondary">
              <span>Proporção Total:</span>
              <span className="font-mono font-bold text-accent">{(hoveredStage.pct).toFixed(1)}%</span>
            </p>
            {hoveredStage.drop > 0 && (
              <p className="flex justify-between gap-6 text-red-400 font-medium">
                <span>Drop-off (Etapa Ant.):</span>
                <span className="font-mono font-bold">-{hoveredStage.drop.toFixed(1)}%</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 p-2 bg-surface/50 border border-border-subtle rounded flex items-start space-x-2 text-[10px] leading-relaxed text-text-secondary">
        <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
        <span>
          <strong>Nota Metodológica:</strong> Distribuição atual por etapa no dataset sintético; não representa jornada longitudinal do mesmo candidato, salvo quando houver histórico temporal por candidato.
        </span>
      </div>
    </div>
  );
}
