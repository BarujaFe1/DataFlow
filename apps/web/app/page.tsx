"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  FileText, 
  Database, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CornerDownRight,
  ExternalLink,
  Lock,
  Unlock
} from "lucide-react";
import Papa from "papaparse";
import Link from "next/link";

import { AnalysisResponse } from "@/types/analysis";
import { fetchDemoData, uploadAndAnalyzeFile, warmUpBackend } from "@/lib/api";
import { ColumnMapper } from "../lib/mapper_client"; 
import { generateStructuredInsights } from "@/lib/insights/generateInsights";

// Components
import MappingWizard from "@/components/upload/MappingWizard";
import KPICards from "@/components/dashboard/KPICards";
import QualityFlags from "@/components/dashboard/QualityFlags";
import ChartsPanel from "@/components/charts/ChartsPanel";
import DataTable from "@/components/table/DataTable";
import InferencePanel from "@/components/dashboard/InferencePanel";
import ReportView from "@/components/report/ReportView";
import ExecutiveHero from "@/components/dashboard/ExecutiveHero";
import PipelineTimeline from "@/components/dashboard/PipelineTimeline";
import ResponsibleAnalyticsCenter from "@/components/dashboard/ResponsibleAnalyticsCenter";
import SidebarNav from "@/components/dashboard/SidebarNav";


export default function Home() {
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"landing" | "dashboard" | "report">("landing");

  // Privacy & LGPD State
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(true);

  // File Upload State
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [autoMapping, setAutoMapping] = useState<Record<string, string | null>>({});
  const [isMappingMode, setIsMappingMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-load demo data if ?demo=true query parameter is present (portfolio showcase link)
  useEffect(() => {
    warmUpBackend();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "true") {
        handleLoadDemo();
      }
    }
  }, []);

  const handleLoadDemo = async () => {
    setIsLoading(true);
    setError(null);
    setIsPrivacyEnabled(true); // Demo mode starts with privacy active by default
    try {
      const data = await fetchDemoData();
      setActiveAnalysis(data);
      setView("dashboard");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erro ao carregar os dados de demonstração. Verifique se o servidor FastAPI está ativo na porta 8000.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Apenas arquivos CSV são suportados na V1.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPendingFile(file);

    // Read headers client-side using PapaParse
    Papa.parse(file, {
      preview: 5,
      header: false,
      complete: (results) => {
        setIsLoading(false);
        if (results.data && results.data.length > 0) {
          const headers = results.data[0] as string[];
          setRawHeaders(headers);
          
          // Suggest mapping using local client-side logic
          const suggested = ColumnMapper.autoDetect(headers);
          setAutoMapping(suggested);
          setIsMappingMode(true);
        } else {
          setError("Não foi possível detectar cabeçalhos no arquivo CSV.");
        }
      },
      error: (err) => {
        setIsLoading(false);
        setError(`Falha ao ler o arquivo CSV: ${err.message}`);
      }
    });
  };

  const handleConfirmMapping = async (mapping: Record<string, string | null>) => {
    if (!pendingFile) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await uploadAndAnalyzeFile(pendingFile, mapping);
      setActiveAnalysis(data);
      setIsMappingMode(false);
      setView("dashboard");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Erro ao analisar o arquivo CSV enviado.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelMapping = () => {
    setIsMappingMode(false);
    setPendingFile(null);
    setRawHeaders([]);
    setAutoMapping({});
  };

  const handleReset = () => {
    setActiveAnalysis(null);
    setPendingFile(null);
    setRawHeaders([]);
    setAutoMapping({});
    setIsMappingMode(false);
    setError(null);
    setView("landing");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Helper to scroll smoothly to a selector
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // RENDER LANDING VIEW
  if (view === "landing" && !isMappingMode) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Decorative background gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-success/5 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="w-full max-w-3xl flex flex-col items-center text-center z-10">
          
          <div className="flex items-center space-x-2.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portfólio de Felipe Baruja</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-text-primary mb-4">
            Data<span className="text-accent">Flow</span>
          </h1>
          <p className="text-base md:text-lg text-text-secondary max-w-xl leading-relaxed mb-8">
            Mapeie, limpe, audite a integridade e analise estatisticamente seus datasets brutos em um fluxo de portfólio completo.
          </p>

          {error && (
            <div className="w-full mb-8 p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-start space-x-3 text-sm text-danger text-left">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Erro:</span> {error}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center space-y-4 py-8">
              <RefreshCw className="w-10 h-10 text-accent animate-spin" />
              <span className="text-sm text-text-secondary font-medium animate-pulse">Carregando e executando pipeline de dados...</span>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border-subtle hover:border-border-hover rounded-xl p-10 bg-surface/30 cursor-pointer flex flex-col items-center justify-center transition group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <div className="p-4 rounded-full bg-border-subtle group-hover:bg-accent/10 group-hover:text-accent transition duration-300">
                  <Upload className="w-6 h-6 text-text-secondary group-hover:text-accent transition" />
                </div>
                <span className="text-sm font-semibold text-text-primary mt-4 group-hover:text-accent transition">
                  Arraste seu arquivo CSV ou clique para fazer upload
                </span>
                <span className="text-xs text-text-muted mt-1.5">
                  Suporta arquivos delimitados por vírgula ou ponto-e-vírgula.
                </span>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <div className="h-px bg-border-subtle w-24"></div>
                <span className="text-xs text-text-muted uppercase font-mono">Ou</span>
                <div className="h-px bg-border-subtle w-24"></div>
              </div>

              {/* Demo button */}
              <button
                onClick={handleLoadDemo}
                className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg font-medium text-text-primary bg-surface-elevated border border-border-subtle hover:border-border-hover hover:bg-surface transition self-center cursor-pointer shadow-md"
              >
                <Database className="w-4 h-4 text-accent" />
                <span>Carregar Dataset Demonstrativo (Processo Seletivo)</span>
              </button>

              {/* Showcase Link */}
              <Link 
                href="/showcase" 
                className="text-xs font-semibold text-accent hover:text-opacity-85 transition mt-4 flex items-center justify-center space-x-1"
              >
                <span>Ver Metodologia & Pitch de Portfólio</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Pipeline stages teaser */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full text-left text-xs text-text-secondary border-t border-border-subtle pt-10">
            <div>
              <span className="font-semibold text-text-primary block mb-1">1. Ingestão & Mapeamento</span>
              Upload e alinhamento das colunas da planilha ao schema.
            </div>
            <div>
              <span className="font-semibold text-text-primary block mb-1">2. Profiling & Limpeza</span>
              Health score, flags de qualidade, casing e duplicatas.
            </div>
            <div>
              <span className="font-semibold text-text-primary block mb-1">3. EDA & Visualização</span>
              Análises descritivas, funis, canais e gráficos responsivos.
            </div>
            <div>
              <span className="font-semibold text-text-primary block mb-1">4. Estatística & Relatório</span>
              Qui-quadrado, ANOVA, teste t e exportação de PDF.
            </div>
          </div>
        </div>
      </main>
    );
  }

  // RENDER COLUMN MAPPING WIZARD
  if (isMappingMode) {
    return (
      <main className="min-h-screen bg-background text-foreground py-12 px-6 flex flex-col items-center justify-center font-sans">
        <MappingWizard
          headers={rawHeaders}
          autoMapping={autoMapping}
          onConfirm={handleConfirmMapping}
          onCancel={handleCancelMapping}
          isLoading={isLoading}
        />
      </main>
    );
  }

  // RENDER REPORT VIEW
  if (view === "report" && activeAnalysis) {
    return (
      <main className="min-h-screen bg-background py-8">
        <ReportView data={activeAnalysis} onBack={() => setView("dashboard")} isPrivacyEnabled={isPrivacyEnabled} />
      </main>
    );
  }

  // RENDER DASHBOARD VIEW
  if (view === "dashboard" && activeAnalysis) {
    const { quality, kpis, charts, inference, metadata } = activeAnalysis;

    // Generate rich insights
    const structuredInsights = generateStructuredInsights(activeAnalysis);
    
    // Distribute insights into categories
    const kpiInsights = structuredInsights.filter(i => i.type === "kpi_milestone");
    const riskInsights = structuredInsights.filter(i => i.type === "quality_alert" || i.type === "bias_warning");
    const recommendationInsights = structuredInsights.filter(i => i.type === "actionable_recommendation");

    return (
      <main className="min-h-screen bg-background text-foreground font-sans flex flex-col">
        
        {/* Dashboard Nav Bar */}
        <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center space-x-1.5">
              <Link href="/showcase" className="hover:text-accent transition">DataFlow</Link>
              <span className="text-accent">/</span>
              <span className="text-xs font-mono font-normal bg-border-subtle px-2.5 py-0.5 rounded-full text-text-secondary capitalize">
                {metadata.source === "demo" ? "Dataset Demo" : "Upload CSV"}
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* LGPD/Privacy Toggle in Header */}
            <button
              onClick={() => setIsPrivacyEnabled(!isPrivacyEnabled)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                isPrivacyEnabled
                  ? "bg-success/10 border-success/30 text-success hover:bg-success/15"
                  : "bg-surface border-border-subtle text-text-secondary hover:border-border-hover hover:text-text-primary"
              }`}
              title={isPrivacyEnabled ? "LGPD Ativo: Nomes/e-mails mascarados" : "LGPD Inativo: Dados completos visíveis"}
            >
              {isPrivacyEnabled ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>LGPD Ativo</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-warning shrink-0" />
                  <span>LGPD Inativo</span>
                </>
              )}
            </button>

            <Link
              href="/showcase"
              className="text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-2 transition"
            >
              Documentação Portfolio
            </Link>
            
            <button
              onClick={() => setView("report")}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-text-primary bg-surface-elevated border border-border-subtle hover:border-border-hover rounded-lg transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-accent" />
              <span>Gerar Relatório PDF</span>
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-black bg-accent rounded-lg hover:bg-opacity-90 transition cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Carregar Novo CSV</span>
            </button>

          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-6 animate-fade-in">
          
          {/* Left Sidebar Navigation */}
          <SidebarNav onGenerateReport={() => setView("report")} />

          {/* Right Main Content */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            
            <div id="briefing" className="scroll-mt-24 flex flex-col gap-6">
              {/* Executive Data Briefing Hero */}
              <ExecutiveHero 
                analysis={activeAnalysis}
                onGenerateReport={() => setView("report")}
                onReset={handleReset}
                onScrollToSection={scrollToId}
              />

              {/* Pipeline Timeline Stepper */}
              <PipelineTimeline 
                analysis={activeAnalysis}
              />

              {/* Dynamic Secondary Insight Cards (No truncation) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
                
                {/* O que importa */}
                <div className="glass-card p-5 border border-border-subtle flex flex-col justify-between min-h-[190px]">
                  <div>
                    <div className="flex items-center space-x-2 text-accent font-semibold text-xs mb-3">
                      <TrendingUp className="w-4 h-4 shrink-0" />
                      <span>O que importa (Métricas)</span>
                    </div>
                    <h4 className="text-sm font-bold text-text-primary">{kpiInsights[0]?.title || "Métricas e canais mapeados"}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed mt-2.5">
                      {kpiInsights[0]?.description || `O canal líder de atração na base é ${kpis.top_source_channel || "Gupy"} com taxa de aprovação calibrada.`}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted mt-2">{kpiInsights[0]?.metric || "KPIs Calculados"}</span>
                </div>

                {/* Risco detectado */}
                <div className="glass-card p-5 border border-border-subtle flex flex-col justify-between min-h-[190px]">
                  <div>
                    <div className="flex items-center space-x-2 text-danger font-semibold text-xs mb-3">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Risco Detectado</span>
                    </div>
                    <h4 className="text-sm font-bold text-text-primary">{riskInsights[0]?.title || "Integridade de dados"}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed mt-2.5">
                      {riskInsights[0]?.description || "Anomalias menores de preenchimento foram limpas de forma automatizada pelo pipeline."}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted mt-2">{riskInsights[0]?.metric || `Score: ${quality.health_score}`}</span>
                </div>

                {/* Oportunidade */}
                <div className="glass-card p-5 border border-border-subtle flex flex-col justify-between min-h-[190px]">
                  <div>
                    <div className="flex items-center space-x-2 text-accent-success font-semibold text-xs mb-3">
                      <Lightbulb className="w-4 h-4 shrink-0" />
                      <span>Oportunidade</span>
                    </div>
                    <h4 className="text-sm font-bold text-text-primary">{recommendationInsights[0]?.title || "Evolução do funil"}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed mt-2.5">
                      {recommendationInsights[0]?.description || "Otimizar canais de atração de acordo com os p-valores e taxas de sucesso."}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted mt-2">{recommendationInsights[0]?.metric || "Melhoria Operacional"}</span>
                </div>

                {/* Próxima ação sugerida */}
                <div className="glass-card p-5 border border-border-subtle flex flex-col justify-between min-h-[190px]">
                  <div>
                    <div className="flex items-center space-x-2 text-warning font-semibold text-xs mb-3">
                      <CornerDownRight className="w-4 h-4 shrink-0" />
                      <span>Próxima Ação Sugerida</span>
                    </div>
                    <h4 className="text-sm font-bold text-text-primary">Ação Recomendada</h4>
                    <p className="text-xs text-text-secondary leading-relaxed mt-2.5">
                      {recommendationInsights[0]?.recommendedAction || riskInsights[0]?.recommendedAction || "Investigar os canais de captação que apresentam maior desvio de qualidade."}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted mt-2 font-semibold">Ação Operacional</span>
                </div>

              </div>

              {/* Normalization cleaning logs banner */}
              {charts.cleaning_logs && charts.cleaning_logs.length > 0 && (
                <div className="p-4 bg-accent/5 border border-accent/15 rounded-xl flex items-start space-x-3 text-xs leading-relaxed text-text-secondary">
                  <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-text-primary block mb-1">Ações de Normalização Aplicadas (Local-first Clean):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                      {charts.cleaning_logs.map((log, i) => (
                        <div key={i} className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Top KPIs Cards */}
              <KPICards kpis={kpis} />
            </div>

            {/* Data Quality Cockpit (Full Width Refactored) */}
            <div id="qualidade" className="scroll-mt-24">
              <QualityFlags quality={quality} kpis={kpis} />
            </div>

            {/* Charts Panel (Funnel and Correlation Matrix) */}
            <div id="funil" className="scroll-mt-24">
              <ChartsPanel charts={charts} records={activeAnalysis.records || []} />
            </div>

            {/* Responsible Analytics Center */}
            <div id="etica" className="scroll-mt-24">
              <ResponsibleAnalyticsCenter 
                columns={quality.columns}
                isPrivacyEnabled={isPrivacyEnabled}
                onTogglePrivacy={() => setIsPrivacyEnabled(!isPrivacyEnabled)}
              />
            </div>

            {/* Inference Statistical Tests (Statistical Evidence Center) */}
            <div id="estatistica" className="scroll-mt-24">
              <InferencePanel inference={inference} />
            </div>

            <div id="registros" className="scroll-mt-24">
              <DataTable 
                data={activeAnalysis.records || []} 
                headers={activeAnalysis.charts.available_headers || []} 
                isPrivacyEnabled={isPrivacyEnabled}
                columnsProfile={activeAnalysis.quality.columns}
                inference={activeAnalysis.inference}
              />
            </div>

          </div>

        </div>
      </main>
    );
  }

  return null;
}
