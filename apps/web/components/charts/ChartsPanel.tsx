"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { AnalysisResponse } from "@/types/analysis";

// Custom Premium Components
import OperationalFunnel from "./OperationalFunnel";
import CorrelationMatrix from "./CorrelationMatrix";
import BoxplotOutliers from "./BoxplotOutliers";

interface ChartsPanelProps {
  charts: AnalysisResponse["charts"];
  records: Record<string, unknown>[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    fill?: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border-subtle p-3 rounded-lg shadow-xl text-xs font-sans">
        <p className="font-semibold text-text-primary mb-1">{label}</p>
        {payload.map((pld, index) => (
          <div key={index} className="flex items-center space-x-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pld.color || pld.fill }}></span>
            <span className="text-text-secondary">{pld.name}:</span>
            <span className="font-semibold text-text-primary font-mono">
              {pld.name.includes("Taxa") || pld.name.includes("Completude") 
                ? `${(pld.value * 100).toFixed(1)}%` 
                : pld.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartsPanel({ charts, records }: ChartsPanelProps) {
  const timeline = charts.timeline || [];
  const funnel = charts.funnel || [];
  const sources = charts.sources || [];
  const scoreDist = charts.score_test_distribution || [];
  const missingness = charts.missingness || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 1. Timeline of signups */}
      {timeline.length > 0 && (
        <div className="glass-card p-6 flex flex-col h-[380px] bg-surface/30 border border-border-subtle rounded-2xl">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-text-primary">Evolução Temporal de Inscrições</h4>
            <span className="text-xs text-text-muted">Volume acumulado de candidatos por dia de registro</span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8ab4ff" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#8ab4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Inscrições" 
                  stroke="#8ab4ff" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. Premium SVG Funnel (Replaces old vertical bar chart) */}
      {funnel.length > 0 && (
        <OperationalFunnel funnelData={funnel} totalCandidates={records.length} />
      )}

      {/* 3. Channels & Conversion with DataFlow premium palette */}
      {sources.length > 0 && (
        <div className="glass-card p-6 flex flex-col h-[380px] bg-surface/30 border border-border-subtle rounded-2xl">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-text-primary">Eficiência por Canal de Atração</h4>
            <span className="text-xs text-text-muted">Volume absoluto por canal e respectiva conversão relativa</span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="source" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }} />
                
                {/* Neutral blue for Volume, Success green for Approval Rate */}
                <Bar yAxisId="left" dataKey="count" name="Volume de Inscritos" fill="#8ab4ff" radius={[4, 4, 0, 0]} opacity={0.65} />
                <Bar yAxisId="right" dataKey="approval_rate" name="Taxa de Aprovação" fill="#7ee787" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. Score Test distribution with DataFlow premium highlight */}
      {scoreDist.length > 0 && (
        <div className="glass-card p-6 flex flex-col h-[380px] bg-surface/30 border border-border-subtle rounded-2xl">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-text-primary">Distribuição de Notas do Teste</h4>
            <span className="text-xs text-text-muted">Frequência de notas e destaque para notas de aprovação (&gt; 70)</span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDist} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="bin" stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Frequência" fill="#8ab4ff" radius={[4, 4, 0, 0]}>
                  {scoreDist.map((entry, idx) => {
                    const bracketStart = parseInt(entry.bin.split("-")[0]);
                    return (
                      <Cell 
                        key={`cell-${idx}`} 
                        fill={bracketStart >= 70 ? "#7ee787" : "#8ab4ff"} 
                        opacity={bracketStart >= 70 ? 0.95 : 0.5}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 5. Spearman Correlation Matrix (4x4) */}
      <CorrelationMatrix records={records} />

      {/* 6. Outlier Distributions (Boxplots) */}
      <BoxplotOutliers records={records} />

      {/* 7. Column completeness (Full width at bottom) */}
      {missingness.length > 0 && (
        <div className="glass-card p-6 flex flex-col h-[380px] lg:col-span-2 bg-surface/30 border border-border-subtle rounded-2xl">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-text-primary">Taxa de Completude por Campo (Filling Rate)</h4>
            <span className="text-xs text-text-muted">Percentual de valores não-nulos identificados na base</span>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missingness} layout="vertical" margin={{ top: 5, right: 20, left: 45, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                <XAxis type="number" domain={[0, 1]} stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis dataKey="column" type="category" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completeness_rate" name="Completude" fill="#8ab4ff" radius={[0, 4, 4, 0]}>
                  {missingness.map((entry, idx) => (
                    <Cell 
                      key={`cell-${idx}`} 
                      fill={entry.completeness_rate >= 0.95 ? "#7ee787" : entry.completeness_rate >= 0.80 ? "#f2cc60" : "#ff7b72"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
