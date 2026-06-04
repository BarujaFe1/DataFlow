import React from "react";
import { ShieldCheck, ShieldAlert, Check } from "lucide-react";

interface HealthScoreProps {
  score: number;
  summary: string;
  datasetFlags: string[];
}

export default function HealthScore({ score, summary, datasetFlags }: HealthScoreProps) {
  // Determine color based on score
  const getScoreColor = (val: number) => {
    if (val >= 85) return "stroke-success text-success bg-success/10 border-success/20";
    if (val >= 70) return "stroke-warning text-warning bg-warning/10 border-warning/20";
    if (val >= 50) return "stroke-accent text-accent bg-accent/10 border-accent/20";
    return "stroke-danger text-danger bg-danger/10 border-danger/20";
  };

  const getScoreClass = (val: number) => {
    if (val >= 85) return "text-success";
    if (val >= 70) return "text-warning";
    if (val >= 50) return "text-accent";
    return "text-danger";
  };

  const colorClasses = getScoreColor(score);
  const colorClassArray = colorClasses.split(" ");
  const strokeColor = colorClassArray[0];

  // SVG parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-6 h-full flex flex-col md:flex-row items-center gap-6">
      {/* Circle Gauge */}
      <div className="relative flex items-center justify-center shrink-0 w-36 h-36">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-border-subtle"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Foreground circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className={`${strokeColor} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-text-primary tracking-tight">{score}</span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">Score</span>
        </div>
      </div>

      {/* Summary details */}
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          {score >= 70 ? (
            <ShieldCheck className={`w-5 h-5 ${getScoreClass(score)}`} />
          ) : (
            <ShieldAlert className={`w-5 h-5 ${getScoreClass(score)}`} />
          )}
          <h3 className="font-semibold text-text-primary">Saúde dos Dados</h3>
        </div>

        <p className="text-sm text-text-secondary mt-3 leading-relaxed">
          {summary}
        </p>

        {datasetFlags.length > 0 && (
          <div className="mt-4">
            <span className="text-xs font-semibold text-text-secondary block mb-2">
              Alertas de Qualidade:
            </span>
            <div className="flex flex-wrap gap-2">
              {datasetFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-danger/10 border border-danger/20 text-danger"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {datasetFlags.length === 0 && (
          <div className="flex items-center space-x-2 text-success text-xs font-medium mt-4">
            <div className="p-1 rounded-full bg-success/15 border border-success/20">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Nenhum alerta de integridade crítico emitido.</span>
          </div>
        )}
      </div>
    </div>
  );
}
