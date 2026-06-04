"use client";

import React, { useMemo } from "react";
import { Info } from "lucide-react";

interface CorrelationMatrixProps {
  records: Record<string, unknown>[];
}

const VARIABLES = [
  { key: "experience_years", label: "Anos Exp" },
  { key: "salary_expectation", label: "Expectativa Sal" },
  { key: "score_test", label: "Nota Teste" },
  { key: "score_interview", label: "Nota Entrevista" }
];

// Helper to compute rank of an array (Spearman Rank Correlation)
function getRanks(arr: number[]): number[] {
  const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
  const ranks = new Array(arr.length);
  
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].val === sorted[i].val) {
      j++;
    }
    
    // Average rank for ties
    const avgRank = 1 + (i + j - 1) / 2;
    for (let k = i; k < j; k++) {
      ranks[sorted[k].idx] = avgRank;
    }
    i = j;
  }
  
  return ranks;
}

// Compute Pearson correlation on two arrays
function getPearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  let num = 0;
  let denX = 0;
  let denY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }
  
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

// Spearman rank correlation calculator
function getSpearman(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  const rankX = getRanks(x);
  const rankY = getRanks(y);
  return getPearson(rankX, rankY);
}

export default function CorrelationMatrix({ records }: CorrelationMatrixProps) {
  const matrix = useMemo(() => {
    // 1. Filter valid rows where all 4 variables are present and are numbers
    const validRows = records.filter(row => {
      return VARIABLES.every(v => {
        const val = row[v.key];
        return val !== null && val !== undefined && !isNaN(Number(val));
      });
    });

    const n = validRows.length;
    if (n < 2) {
      return Array(4).fill(0).map(() => Array(4).fill(0));
    }

    // 2. Extract vectors
    const vectors: Record<string, number[]> = {};
    VARIABLES.forEach(v => {
      vectors[v.key] = validRows.map(row => Number(row[v.key] as number));
    });

    // 3. Compute Spearman matrix
    const res: number[][] = [];
    for (let i = 0; i < 4; i++) {
      res[i] = [];
      for (let j = 0; j < 4; j++) {
        res[i][j] = getSpearman(vectors[VARIABLES[i].key], vectors[VARIABLES[j].key]);
      }
    }
    return res;
  }, [records]);

  // Color mapping based on correlation value (-1 to 1)
  const getShadingStyle = (val: number) => {
    const absVal = Math.abs(val);
    if (val > 0) {
      // Shading accent blue (#8ab4ff)
      return {
        backgroundColor: `rgba(138, 180, 255, ${absVal * 0.4})`,
        color: absVal > 0.5 ? "#ffffff" : "#a1a1aa"
      };
    } else {
      // Shading warning/danger red
      return {
        backgroundColor: `rgba(239, 68, 68, ${absVal * 0.4})`,
        color: absVal > 0.5 ? "#ffffff" : "#a1a1aa"
      };
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col h-[380px] bg-surface/30 border border-border-subtle rounded-2xl w-full">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-text-primary">Matriz de Correlação (Spearman)</h4>
        <span className="text-xs text-text-muted">Associação ordinal 4x4 das variáveis numéricas</span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        {/* Heatmap Grid */}
        <div className="grid grid-cols-5 gap-1.5 w-full max-w-[340px]">
          {/* Header Row */}
          <div></div>
          {VARIABLES.map((v, i) => (
            <div key={i} className="text-[10px] font-bold text-center text-text-muted truncate px-1" title={v.label}>
              {v.label}
            </div>
          ))}

          {/* Grid Rows */}
          {VARIABLES.map((rowVar, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {/* Row Header */}
              <div className="text-[10px] font-bold text-left text-text-muted flex items-center pr-1 truncate" title={rowVar.label}>
                {rowVar.label}
              </div>

              {/* Matrix Cells */}
              {VARIABLES.map((colVar, colIndex) => {
                const val = matrix[rowIndex][colIndex];
                const style = getShadingStyle(val);
                return (
                  <div
                    key={colIndex}
                    style={style}
                    className="aspect-square flex items-center justify-center rounded border border-border-subtle/30 text-xs font-semibold font-mono transition duration-300 hover:border-text-muted cursor-default"
                    title={`${rowVar.label} vs ${colVar.label} = ${val.toFixed(4)}`}
                  >
                    {val.toFixed(2)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-4 p-2 bg-surface border border-border-subtle rounded flex items-start space-x-2 text-[10px] leading-relaxed text-text-secondary">
        <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
        <span>
          <strong>Correlação não implica causalidade:</strong> Coeficientes perto de ±1 indicam forte tendência de variação conjunta de ranking, não necessariamente influência direta.
        </span>
      </div>
    </div>
  );
}
