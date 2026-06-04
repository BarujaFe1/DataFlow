"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutGrid, ShieldCheck, Scale, Database, Compass, Eye, ShieldAlert, BookOpen, ExternalLink } from "lucide-react";

interface SidebarNavProps {
  onGenerateReport: () => void;
}

const NAV_ITEMS = [
  { id: "briefing", label: "Briefing Executivo", icon: Compass },
  { id: "qualidade", label: "Qualidade & Issues", icon: ShieldCheck },
  { id: "funil", label: "Funil & Canais", icon: LayoutGrid },
  { id: "etica", label: "Governança Ética", icon: ShieldAlert },
  { id: "estatistica", label: "Evidência Estatística", icon: Scale },
  { id: "registros", label: "Registros Ingeridos", icon: Database }
];

export default function SidebarNav({ onGenerateReport }: SidebarNavProps) {
  const [activeSection, setActiveSection] = useState<string>("briefing");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -75% 0px",
      threshold: 0
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-[88px] lg:h-[calc(100vh-120px)] flex flex-col justify-between p-4 bg-surface/40 border border-border-subtle rounded-2xl h-fit">
      <div className="flex flex-col gap-5">
        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest px-2 block">
          Navegação Rápida
        </span>

        {/* Navigation list */}
        <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                className={`flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold rounded-lg border transition shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-accent/10 border-accent/30 text-accent"
                    : "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-surface/50"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-accent" : "text-text-muted"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Action & Links in Sidebar */}
      <div className="flex flex-col border-t border-border-subtle pt-4 mt-4 gap-2">
        <button
          onClick={onGenerateReport}
          className="w-full py-2 rounded-lg text-[11px] font-semibold text-text-primary bg-surface-elevated hover:bg-surface border border-border-subtle hover:border-border-hover transition flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-accent" />
          <span>Ver PDF Executivo</span>
        </button>

        <div className="hidden lg:flex flex-col gap-1.5 mt-2 border-t border-border-subtle/50 pt-3">
          <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest px-2 block mb-1">
            Documentação
          </span>
          <Link
            href="/showcase"
            className="flex items-center space-x-2 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary transition rounded-lg hover:bg-surface/30"
          >
            <ExternalLink className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span>Showcase Pitch</span>
          </Link>
          <Link
            href="/methodology"
            className="flex items-center space-x-2 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary transition rounded-lg hover:bg-surface/30"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Metodologia</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
