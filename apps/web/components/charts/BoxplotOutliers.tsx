"use client";

import React, { useState, useMemo } from "react";
import { Info } from "lucide-react";

interface BoxplotOutliersProps {
  records: Record<string, unknown>[];
}

interface BoxplotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  lowFence: number;
  highFence: number;
  outliers: number[];
  cleanMin: number;
  cleanMax: number;
}

function calculateBoxplotStats(values: number[]): BoxplotStats {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  
  if (n === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0, lowFence: 0, highFence: 0, outliers: [], cleanMin: 0, cleanMax: 0 };
  }

  const getPercentile = (p: number) => {
    const pos = (n - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  };

  const min = sorted[0];
  const max = sorted[n - 1];
  const q1 = getPercentile(0.25);
  const median = getPercentile(0.50);
  const q3 = getPercentile(0.75);
  
  const iqr = q3 - q1;
  const lowFence = q1 - 1.5 * iqr;
  const highFence = q3 + 1.5 * iqr;
  
  const outliers = sorted.filter(v => v < lowFence || v > highFence);
  const nonOutliers = sorted.filter(v => v >= lowFence && v <= highFence);
  
  const cleanMin = nonOutliers.length > 0 ? nonOutliers[0] : q1;
  const cleanMax = nonOutliers.length > 0 ? nonOutliers[nonOutliers.length - 1] : q3;

  return {
    min,
    q1,
    median,
    q3,
    max,
    lowFence,
    highFence,
    outliers,
    cleanMin,
    cleanMax
  };
}

export default function BoxplotOutliers({ records }: BoxplotOutliersProps) {
  const [selectedVar, setSelectedVar] = useState<"salary" | "experience" | "score_test" | "score_interview">("salary");

  const computedData = useMemo(() => {
    if (selectedVar === "salary" || selectedVar === "experience") {
      const key = selectedVar === "salary" ? "salary_expectation" : "experience_years";
      const values = records
        .map(r => r[key] as number)
        .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
        .map(v => Number(v));
      
      const stats = calculateBoxplotStats(values);
      return { type: "single" as const, stats, label: selectedVar === "salary" ? "Pretensão Salarial" : "Anos de Experiência" };
    } else {
      const key = selectedVar;
      const approvedValues = records
        .filter(r => (r.final_status as string) === "Aprovado")
        .map(r => r[key] as number)
        .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
        .map(v => Number(v));

      const othersValues = records
        .filter(r => (r.final_status as string) !== "Aprovado")
        .map(r => r[key] as number)
        .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
        .map(v => Number(v));

      const approvedStats = calculateBoxplotStats(approvedValues);
      const othersStats = calculateBoxplotStats(othersValues);

      return {
        type: "compare" as const,
        approvedStats,
        othersStats,
        label: selectedVar === "score_test" ? "Nota Teste por Status" : "Nota Entrevista por Status"
      };
    }
  }, [records, selectedVar]);

  // UI mapping scale factors to draw on SVG
  const getSVGDimensions = (statsList: BoxplotStats[]) => {
    let absoluteMin = Math.min(...statsList.map(s => s.min));
    let absoluteMax = Math.max(...statsList.map(s => s.max));
    
    // Add margin
    const diff = absoluteMax - absoluteMin;
    absoluteMin = Math.max(0, absoluteMin - diff * 0.05);
    absoluteMax = absoluteMax + diff * 0.05;

    const scale = (val: number) => {
      const range = absoluteMax - absoluteMin;
      if (range === 0) return 50;
      return 30 + ((val - absoluteMin) / range) * 340; // scales between 30 and 370px width
    };

    return { scale, absoluteMin, absoluteMax };
  };

  const renderSingleBoxplot = (stats: BoxplotStats, label: string) => {
    const { scale } = getSVGDimensions([stats]);
    
    const xMin = scale(stats.cleanMin);
    const xQ1 = scale(stats.q1);
    const xMedian = scale(stats.median);
    const xQ3 = scale(stats.q3);
    const xMax = scale(stats.cleanMax);

    const isSalary = selectedVar === "salary";

    const formatVal = (v: number) => {
      if (isSalary) {
        return `R$ ${v.toFixed(0)}`;
      }
      return v.toFixed(1);
    };

    return (
      <div className="w-full flex flex-col gap-3">
        <svg viewBox="0 0 400 90" className="w-full h-[90px] overflow-visible">
          {/* Whiskers line */}
          <line x1={xMin} y1="40" x2={xQ1} y2="40" stroke="#71717a" strokeWidth="2" strokeDasharray="3 3" />
          <line x1={xQ3} y1="40" x2={xMax} y2="40" stroke="#71717a" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Whisker caps */}
          <line x1={xMin} y1="30" x2={xMin} y2="50" stroke="#71717a" strokeWidth="2" />
          <line x1={xMax} y1="30" x2={xMax} y2="50" stroke="#71717a" strokeWidth="2" />
          
          {/* Box */}
          <rect x={xQ1} y={20} width={xQ3 - xQ1} height={40} fill="rgba(138, 180, 255, 0.15)" stroke="#8ab4ff" strokeWidth="2" />
          
          {/* Median line */}
          <line x1={xMedian} y1={20} x2={xMedian} y2={60} stroke="#f2cc60" strokeWidth="3" />
          
          {/* Outliers */}
          {stats.outliers.map((out, idx) => (
            <circle key={idx} cx={scale(out)} cy="40" r="4.5" fill="#ef4444" opacity="0.8" className="animate-pulse" />
          ))}

          {/* Value labels */}
          <text x={xMin} y="75" fontSize="8" fill="#71717a" textAnchor="middle" className="font-mono">{formatVal(stats.cleanMin)}</text>
          <text x={xQ1} y="15" fontSize="8" fill="#a1a1aa" textAnchor="middle" className="font-mono">Q1: {formatVal(stats.q1)}</text>
          <text x={xMedian} y="75" fontSize="8.5" fill="#f2cc60" fontWeight="bold" textAnchor="middle" className="font-mono">Med: {formatVal(stats.median)}</text>
          <text x={xQ3} y="15" fontSize="8" fill="#a1a1aa" textAnchor="middle" className="font-mono">Q3: {formatVal(stats.q3)}</text>
          <text x={xMax} y="75" fontSize="8" fill="#71717a" textAnchor="middle" className="font-mono">{formatVal(stats.cleanMax)}</text>
        </svg>

        {stats.outliers.length > 0 && (
          <span className="text-[10px] text-danger font-semibold text-center block mt-1">
            Detectados {stats.outliers.length} outliers estatísticos de {label} (pontos vermelhos fora dos limites).
          </span>
        )}
      </div>
    );
  };

  const renderCompareBoxplots = (approved: BoxplotStats, others: BoxplotStats) => {
    const { scale } = getSVGDimensions([approved, others]);

    const formatVal = (v: number) => v.toFixed(1);

    return (
      <div className="w-full flex flex-col gap-6">
        {/* Approved group boxplot */}
        <div className="flex flex-col">
          <div className="flex justify-between text-[10px] text-success font-semibold px-4">
            <span>Aprovados</span>
            <span className="font-mono">Q1: {formatVal(approved.q1)} | Mediana: {formatVal(approved.median)} | Q3: {formatVal(approved.q3)}</span>
          </div>
          <svg viewBox="0 0 400 65" className="w-full h-[65px] overflow-visible mt-1">
            <line x1={scale(approved.cleanMin)} y1="30" x2={scale(approved.q1)} y2="30" stroke="#71717a" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1={scale(approved.q3)} y1="30" x2={scale(approved.cleanMax)} y2="30" stroke="#71717a" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1={scale(approved.cleanMin)} y1="23" x2={scale(approved.cleanMin)} y2="37" stroke="#71717a" strokeWidth="1.5" />
            <line x1={scale(approved.cleanMax)} y1="23" x2={scale(approved.cleanMax)} y2="37" stroke="#71717a" strokeWidth="1.5" />
            
            <rect x={scale(approved.q1)} y={12} width={scale(approved.q3) - scale(approved.q1)} height={36} fill="rgba(126, 231, 135, 0.15)" stroke="#7ee787" strokeWidth="1.5" />
            <line x1={scale(approved.median)} y1={12} x2={scale(approved.median)} y2={48} stroke="#7ee787" strokeWidth="2.5" />
            
            {approved.outliers.map((out, idx) => (
              <circle key={idx} cx={scale(out)} cy="30" r="3.5" fill="#ef4444" opacity="0.8" />
            ))}
          </svg>
        </div>

        {/* Others group boxplot */}
        <div className="flex flex-col">
          <div className="flex justify-between text-[10px] text-text-secondary px-4">
            <span>Outros Status</span>
            <span className="font-mono">Q1: {formatVal(others.q1)} | Mediana: {formatVal(others.median)} | Q3: {formatVal(others.q3)}</span>
          </div>
          <svg viewBox="0 0 400 65" className="w-full h-[65px] overflow-visible mt-1">
            <line x1={scale(others.cleanMin)} y1="30" x2={scale(others.q1)} y2="30" stroke="#71717a" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1={scale(others.q3)} y1="30" x2={scale(others.cleanMax)} y2="30" stroke="#71717a" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1={scale(others.cleanMin)} y1="23" x2={scale(others.cleanMin)} y2="37" stroke="#71717a" strokeWidth="1.5" />
            <line x1={scale(others.cleanMax)} y1="23" x2={scale(others.cleanMax)} y2="37" stroke="#71717a" strokeWidth="1.5" />
            
            <rect x={scale(others.q1)} y={12} width={scale(others.q3) - scale(others.q1)} height={36} fill="rgba(255, 255, 255, 0.05)" stroke="#71717a" strokeWidth="1.5" />
            <line x1={scale(others.median)} y1={12} x2={scale(others.median)} y2={48} stroke="#f2cc60" strokeWidth="2.5" />
            
            {others.outliers.map((out, idx) => (
              <circle key={idx} cx={scale(out)} cy="30" r="3.5" fill="#ef4444" opacity="0.8" />
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-6 flex flex-col h-[380px] bg-surface/30 border border-border-subtle rounded-2xl w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Distribuições e Outliers (Boxplot)</h4>
          <span className="text-xs text-text-muted">Cálculo de dispersão estatística e IQR</span>
        </div>
        
        {/* Toggle buttons */}
        <div className="flex bg-surface border border-border-subtle rounded-lg p-0.5 text-[9px] font-semibold shrink-0">
          <button
            onClick={() => setSelectedVar("salary")}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${selectedVar === "salary" ? "bg-accent text-black font-bold" : "text-text-secondary hover:text-text-primary"}`}
          >
            Salarial
          </button>
          <button
            onClick={() => setSelectedVar("experience")}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${selectedVar === "experience" ? "bg-accent text-black font-bold" : "text-text-secondary hover:text-text-primary"}`}
          >
            Exp
          </button>
          <button
            onClick={() => setSelectedVar("score_test")}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${selectedVar === "score_test" ? "bg-accent text-black font-bold" : "text-text-secondary hover:text-text-primary"}`}
          >
            Teste
          </button>
          <button
            onClick={() => setSelectedVar("score_interview")}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${selectedVar === "score_interview" ? "bg-accent text-black font-bold" : "text-text-secondary hover:text-text-primary"}`}
          >
            Entrevista
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {computedData.type === "single"
          ? renderSingleBoxplot(computedData.stats, computedData.label)
          : renderCompareBoxplots(computedData.approvedStats, computedData.othersStats)
        }
      </div>

      <div className="mt-4 p-2 bg-surface border border-border-subtle rounded flex items-start space-x-2 text-[10px] leading-relaxed text-text-secondary">
        <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
        <span>
          O boxplot ilustra a mediana (linha amarela/verde), a caixa (de Q1 a Q3 contendo 50% dos dados) e os limites normais. Valores além do limite são considerados discrepâncias do pipeline.
        </span>
      </div>
    </div>
  );
}
