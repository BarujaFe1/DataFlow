"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Scale, 
  Database, 
  Cpu, 
  Code,
  CheckCircle,
  FileText,
  Copy,
  Check,
  MessageSquare
} from "lucide-react";
import DemoMetricsStrip from "@/components/landing/DemoMetricsStrip";

export default function ShowcasePage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const elevatorPitch = "O DataFlow é um lab de analytics engineering para auditar e higienizar CSVs de processo seletivo. Ele gera um Health Score explicável, roda testes exploratórios em SciPy (ANOVA, Welch t-test, Qui-quadrado), aplica mascaramento LGPD-aware por padrão e exporta um relatório PDF executivo.";

  const readmeSummary = "DataFlow is a local-first analytics engineering lab for profiling, cleaning and validating tabular recruiting datasets. Built with Next.js 15 and FastAPI, it runs data-quality checks, SciPy exploratory inference and LGPD-aware masking, then exports an executive PDF report.";

  const linkedinPost = `Acabei de publicar o DataFlow — lab de Analytics Engineering + Responsible Analytics.

Stack: Next.js 15, TypeScript, FastAPI, Pandas, SciPy.

O que ele faz de verdade:
1) Mapping wizard de CSV → schema canônico
2) Data Quality Cockpit com Health Score explicável (demo: 82/100 em 305 linhas)
3) Inferência exploratória de processo (Welch, ANOVA, Qui-quadrado)
4) Mascaramento de PII na API por padrão (LGPD-aware)
5) Relatório PDF executivo

Não é SaaS enterprise nem motor de ranking de candidatos — é um case demonstrável de qualidade de dados + produto analítico.

Demo: https://dataflow-sand.vercel.app/?demo=true
Repo: https://github.com/BarujaFe1/DataFlow

#AnalyticsEngineering #DataQuality #DataEngineering #NextJS #Python #FastAPI #LGPD #ResponsibleAnalytics`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-success/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-text-primary flex items-center space-x-2">
          <span>DataFlow</span>
          <span className="text-accent font-normal text-xs bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
            Showcase V1.4
          </span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/"
            className="text-xs font-semibold text-text-secondary hover:text-text-primary transition"
          >
            Acessar Plataforma
          </Link>
          <Link 
            href="/?demo=true"
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-black bg-accent rounded-lg hover:bg-opacity-90 transition shadow-md"
          >
            <span>Executar Demo</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-20 z-10 flex flex-col gap-16">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-2 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Portfólio de Engenharia de Dados & Data Science</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Qualidade de Dados como <span className="text-accent">Produto Demonstrável</span>
          </h1>
          
          <p className="text-base md:text-lg text-text-secondary leading-relaxed">
            Lab local-first para auditoria estrutural de planilhas, limpeza, diagnóstico estatístico exploratório e relatório PDF — pensado para entrevistas de analytics engineering e engenharia de dados.
          </p>

          <DemoMetricsStrip className="mt-2 max-w-3xl mx-auto" />

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Link 
              href="/?demo=true"
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-black bg-accent hover:bg-opacity-95 transition shadow-lg"
            >
              <Database className="w-4 h-4" />
              <span>Visualizar Dashboard Demo</span>
            </Link>
            <Link
              href="/"
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-text-primary bg-surface-elevated border border-border-subtle hover:border-border-hover transition"
            >
              <FileText className="w-4 h-4 text-accent" />
              <span>Analisar meu próprio CSV</span>
            </Link>
          </div>
        </div>

        {/* Interactive Features Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-card p-6 flex flex-col justify-between hover:border-accent/40 transition duration-300 group">
            <div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-accent w-fit mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition">Data Quality Cockpit</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Waterfall de Health Score explicável, matriz de completude visual, issues register com severidades filtráveis e cards de profiling com sparklines nativas.
              </p>
            </div>
            <span className="text-xs text-accent font-semibold flex items-center gap-1.5 mt-4">
              Local-first profiling <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between hover:border-success/40 transition duration-300 group">
            <div>
              <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success w-fit mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-success transition">Estatística Explicável</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Testes inferenciais na SciPy Engine (Welch, ANOVA, Qui-quadrado) com badges verbais de evidência/magnitude, pressupostos claros e comparativos gráficos de médias.
              </p>
            </div>
            <span className="text-xs text-success font-semibold flex items-center gap-1.5 mt-4">
              Scipy inferential engines <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between hover:border-accent-warning/40 transition duration-300 group">
            <div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning w-fit mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-warning transition">Responsible Analytics</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Guardas éticos integrados contra o preconceito algorítmico, listas de uso permitido/proibido, mascaramento LGPD de nomes/emails e log de engenharia de dados.
              </p>
            </div>
            <span className="text-xs text-warning font-semibold flex items-center gap-1.5 mt-4">
              Ética de dados integrada <ArrowRight className="w-3 h-3" />
            </span>
          </div>

        </div>

        {/* In-Interview Pitch Script Section */}
        <div className="glass-card p-6 md:p-8 flex flex-col gap-6 border border-border-subtle bg-surface-elevated/20">
          <div>
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              <span>Como Apresentar o DataFlow em Entrevistas</span>
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Roteiros estruturados para diferentes interlocutores no processo seletivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            
            <div className="p-4 bg-surface rounded-xl border border-border-subtle flex flex-col gap-2">
              <span className="font-bold text-text-primary text-[11px] block">Pitch Curto (30 Segundos - RH/Gestor)</span>
              <p className="text-text-secondary">
                &quot;O DataFlow é um lab de analytics engineering que diagnostica qualidade em bases brutas de recrutamento. Ele identifica duplicatas, mascara PII na API (LGPD-aware), roda testes exploratórios de processo em SciPy e gera relatório PDF executivo — sem ranquear candidatos.&quot;
              </p>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-border-subtle flex flex-col gap-2">
              <span className="font-bold text-text-primary text-[11px] block">Pitch Técnico (60 Segundos - Líder Técnico)</span>
              <p className="text-text-secondary">
                &quot;Desenvolvi o DataFlow sob uma arquitetura de monorepo moderna com Next.js 15 no front e FastAPI com Python no backend. O pipeline executa desduplicação, normalização sintática, cálculo de score de integridade explicável via penalidades, testes de hipóteses inferenciais (Welch t-test, ANOVA de uma via e Qui-quadrado) e exportações de dados mascarados. O relatório PDF é gerado via print stylesheet otimizado.&quot;
              </p>
            </div>

          </div>

          {/* Copy Assets Block */}
          <div className="border-t border-border-subtle/50 pt-5 mt-2 flex flex-col gap-4">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block">Recursos e Resumos Prontos para Copiar</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Copy Elevator Pitch */}
              <div className="p-3 bg-surface rounded-lg border border-border-subtle flex flex-col justify-between gap-3">
                <div className="text-[10px] text-text-secondary font-mono truncate">
                  Elevator Pitch (30s)
                </div>
                <button
                  onClick={() => handleCopy(elevatorPitch, "pitch")}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-accent text-black rounded font-semibold text-xs hover:bg-opacity-90 transition cursor-pointer"
                >
                  {copiedText === "pitch" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === "pitch" ? "Copiado!" : "Copiar Elevator Pitch"}</span>
                </button>
              </div>

              {/* Copy README */}
              <div className="p-3 bg-surface rounded-lg border border-border-subtle flex flex-col justify-between gap-3">
                <div className="text-[10px] text-text-secondary font-mono truncate">
                  Resumo Técnico para README
                </div>
                <button
                  onClick={() => handleCopy(readmeSummary, "readme")}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-elevated border border-border-subtle text-text-primary rounded font-semibold text-xs hover:border-border-hover transition cursor-pointer"
                >
                  {copiedText === "readme" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === "readme" ? "Copiado!" : "Copiar para README"}</span>
                </button>
              </div>

              {/* Copy LinkedIn */}
              <div className="p-3 bg-surface rounded-lg border border-border-subtle flex flex-col justify-between gap-3">
                <div className="text-[10px] text-text-secondary font-mono truncate">
                  Post Completo do LinkedIn
                </div>
                <button
                  onClick={() => handleCopy(linkedinPost, "linkedin")}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-elevated border border-border-subtle text-text-primary rounded font-semibold text-xs hover:border-border-hover transition cursor-pointer"
                >
                  {copiedText === "linkedin" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText === "linkedin" ? "Copiado!" : "Copiar Post LinkedIn"}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Stack & Architecture Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-text-primary">Por que isto importa para vagas de Dados?</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Muitos projetos de portfólio de Ciência e Engenharia de dados resumem-se a scripts estáticos em notebooks do Jupyter. O DataFlow se sobressai ao encapsular modelos matemáticos, algoritmos de engenharia de dados e padrões avançados de design em um <strong>produto digital completo e usável</strong>.
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ele demonstra domínio prático sobre validação de integridade de dados (data validation), arquitetura monorepo moderna, comunicação assíncrona entre APIs e interfaces reativas (Next.js + Tailwind v4 + Recharts).
            </p>
            
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center space-x-2 text-xs text-text-secondary">
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <span>Rigor científico ao interpretar p-valores e tamanhos de efeito.</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-text-secondary">
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <span>Arquitetura modular de software separando lógica de UI.</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-text-secondary">
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <span>Interface legível para demo e navegação por seções analíticas.</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-surface-elevated/40 flex flex-col gap-4 justify-center">
            <h4 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Code className="w-4 h-4 text-accent" />
              <span>Stack de Engenharia Utilizada</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-surface rounded-lg border border-border-subtle">
                <span className="text-accent font-semibold block mb-1">Frontend</span>
                <span>Next.js 15 (App Router)<br />Tailwind CSS v4<br />TypeScript v5<br />Recharts & TanStack Table</span>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-border-subtle">
                <span className="text-success font-semibold block mb-1">Backend</span>
                <span>Python 3.12<br />FastAPI<br />SciPy · Pandas · NumPy</span>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-lg border border-border-subtle text-xs flex items-center gap-2">
              <Cpu className="w-4 h-4 text-warning" />
              <span><strong>Metodologia de PDF:</strong> Otimização via print stylesheet nativa do CSS.</span>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 text-center text-xs text-text-muted mt-12 bg-surface/20">
        <p>DataFlow — Desenvolvido por Felipe Baruja como Projeto Showcase de Engenharia e Análise de Dados.</p>
        <p className="mt-1">Inspirado nos padrões VerboHino, Soniva, StatLab-Experiments e AureaFinance.</p>
      </footer>
    </div>
  );
}
