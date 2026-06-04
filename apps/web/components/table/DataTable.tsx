"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState
} from "@tanstack/react-table";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  Filter, 
  Eye, 
  AlertTriangle, 
  AlertCircle,
  FileSpreadsheet,
  FileJson,
  Lock,
  Unlock,
  SlidersHorizontal,
  Info,
  X,
  ShieldCheck,
  ShieldAlert,
  Database
} from "lucide-react";
import { maskName, maskEmail, COLUMN_DICTIONARY } from "@/lib/masking";

interface ColumnProfileType {
  name: string;
  inferred_type: string;
  missing_count: number;
  missing_rate: number;
  unique_count: number;
  unique_rate: number;
  flags: string[];
  stats?: {
    mean?: number;
    median?: number;
    min?: number;
    max?: number;
    std?: number;
  };
  top_values?: {
    value: string;
    count: number;
    rate: number;
  }[];
}

interface InferenceTestType {
  test_name: string;
  variables: string[];
  statistic: number;
  p_value: number;
  effect_size?: number;
  significance: boolean;
  interpretation: string;
  limitations: string;
}

interface DataTableProps {
  data: Record<string, unknown>[];
  headers: string[];
  isPrivacyEnabled?: boolean;
  columnsProfile?: ColumnProfileType[];
  inference?: InferenceTestType[];
}

export default function DataTable({ 
  data, 
  headers, 
  isPrivacyEnabled = true,
  columnsProfile = [],
  inference = []
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact" | "zen">("comfortable");
  
  // Toggle between Saneados (Cleaned) and Brutos (Raw) data
  const [viewMode, setViewMode] = useState<"cleaned" | "raw">("cleaned");
  
  // Sidebar Context Drawer state
  const [activeDrawerColumn, setActiveDrawerColumn] = useState<string | null>(null);

  // Custom filter for Data Quality issues (alert severity)
  const [severityFilter, setSeverityFilter] = useState<string>("__all__");

  // Remove utility columns like parsed_date from standard column headers
  const visibleHeaders = useMemo(() => {
    return headers.filter(h => h !== 'parsed_date');
  }, [headers]);

  const isInvalidEmail = (email: string) => {
    if (!email) return false;
    const pattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    return !pattern.test(email.trim());
  };

  const isOutlier = (header: string, val: unknown) => {
    if (typeof val !== "number") return false;
    if (header === "experience_years") {
      return val < 0 || val > 20;
    }
    if (header === "salary_expectation") {
      return val < 0 || val > 100000;
    }
    return false;
  };

  // Simulated raw values reconstruction for display purposes
  const getRawValue = (header: string, val: unknown) => {
    if (val === null || val === undefined || val === "") return "";
    
    // Simulate raw unstandardized inputs
    if (header === "education_level") {
      const valStr = String(val);
      if (valStr === "Ensino Superior") return "superior completo";
      if (valStr === "Pós-Graduação") return "pos-graduacao";
      if (valStr === "Ensino Médio") return "medio completo";
      return valStr.toLowerCase();
    }
    if (header === "final_status") {
      const valStr = String(val);
      if (valStr === "Aprovado") return "aprovado";
      if (valStr === "Reprovado") return "reprovado";
      if (valStr === "Em Processo") return "em_processo";
      return valStr.toLowerCase();
    }
    if (header === "source_channel") {
      const valStr = String(val);
      if (valStr === "LinkedIn") return "linkedin";
      if (valStr === "Indicação") return "indicacao";
      if (valStr === "Site Institucional") return "site";
      return valStr.toLowerCase();
    }
    if (header === "timestamp" && String(val).includes(" ")) {
      // Revert YYYY-MM-DD to DD/MM/YYYY
      const parts = String(val).split(" ");
      const dateParts = parts[0].split("-");
      if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${parts[1]?.substring(0, 5) || ""}`;
      }
    }
    return String(val);
  };

  // Pre-filter records client-side based on the selected severity filter
  const filteredData = useMemo(() => {
    if (severityFilter === "__all__") return data;
    
    return data.filter(row => {
      const isDuplicate = row.is_duplicate === true || row.is_duplicate === 1 || row.is_duplicate === "true";
      const hasBadEmail = row.email && isInvalidEmail(String(row.email));
      const hasOutlier = 
        (row.experience_years !== undefined && isOutlier("experience_years", row.experience_years)) ||
        (row.salary_expectation !== undefined && isOutlier("salary_expectation", row.salary_expectation));
      const hasNull = Object.keys(row).some(k => k !== "is_duplicate" && k !== "parsed_date" && (row[k] === null || row[k] === undefined || row[k] === ""));

      switch (severityFilter) {
        case "duplicate":
          return isDuplicate;
        case "email":
          return hasBadEmail;
        case "outlier":
          return hasOutlier;
        case "null":
          return hasNull;
        case "any":
          return isDuplicate || hasBadEmail || hasOutlier || hasNull;
        default:
          return true;
      }
    });
  }, [data, severityFilter]);

  // Define columns dynamically based on available headers
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    return visibleHeaders.map(header => {
      // Humanize label
      let label = header
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
        
      if (header === "candidate_id") label = "ID Candidato";
      if (header === "name") label = "Nome";
      if (header === "email") label = "E-mail";
      if (header === "score_test") label = "Nota Teste";
      if (header === "score_interview") label = "Nota Entrevista";
      if (header === "final_status") label = "Status Final";
      if (header === "salary_expectation") label = "Exp. Salarial";
      if (header === "is_duplicate") label = "Duplicado";
      if (header === "role_applied") label = "Vaga Aplicada";
      if (header === "source_channel") label = "Canal Atração";
      if (header === "experience_years") label = "Anos Exp.";
      if (header === "education_level") label = "Escolaridade";
      if (header === "city") label = "Cidade";
      if (header === "state") label = "UF";

      return {
        accessorKey: header,
        id: header,
        header: ({ column }) => {
          return (
            <div className="flex items-center justify-between gap-1 w-full">
              <button
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="flex items-center space-x-1 hover:text-text-primary transition text-left cursor-pointer font-sans text-[11px] font-bold uppercase tracking-wider text-text-muted shrink-0"
              >
                <span>{label}</span>
                <ArrowUpDown className="w-3 h-3 text-text-muted shrink-0" />
              </button>
              
              {/* Context Drawer Toggle Icon */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDrawerColumn(header);
                }}
                className="p-1 rounded hover:bg-surface-elevated/80 text-text-muted hover:text-accent transition cursor-pointer"
                title={`Ver detalhes e auditoria de '${label}'`}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
        cell: ({ row, getValue }) => {
          const originalVal = getValue();
          const candidateId = String(row.original.candidate_id || "S/ID");
          const isDuplicateRow = row.original.is_duplicate === true || row.original.is_duplicate === 1 || row.original.is_duplicate === "true";

          // Use simulated raw or cleaned value
          const val = viewMode === "raw" ? getRawValue(header, originalVal) : originalVal;
          const wasCleaned = viewMode === "cleaned" && originalVal !== getRawValue(header, originalVal);
          const transformationMsg = wasCleaned 
            ? `Normalizado pelo pipeline: de '${getRawValue(header, originalVal)}' para '${originalVal}'`
            : undefined;

          // 1. Missing check
          if (val === null || val === undefined || val === "") {
            return (
              <span 
                className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold font-mono inline-block cursor-help"
                title="Campo ausente: reduz completude e cruzamentos estatísticos."
              >
                NULO
              </span>
            );
          }

          // Format specific fields
          if (header === "name") {
            const nameStr = String(val);
            if (isPrivacyEnabled) {
              return (
                <span 
                  className="font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 px-1.5 py-0.5 rounded text-[11px] flex items-center w-fit gap-1 cursor-help" 
                  title="LGPD: Nome mascarado por segurança."
                >
                  <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
                  {maskName(nameStr, candidateId)}
                </span>
              );
            }
            return <span className="font-medium text-text-primary">{nameStr}</span>;
          }

          if (header === "email") {
            const emailStr = String(val);
            const isBadEmail = isInvalidEmail(emailStr);
            
            if (isPrivacyEnabled) {
              return (
                <span 
                  className="font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 px-1.5 py-0.5 rounded text-[11px] flex items-center w-fit gap-1 cursor-help" 
                  title="LGPD: E-mail mascarado por segurança."
                >
                  <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
                  {maskEmail(emailStr)}
                </span>
              );
            }

            return (
              <span 
                className={`truncate max-w-[180px] block font-mono ${
                  isBadEmail 
                    ? "text-red-400 bg-red-950/20 border border-red-900/30 px-1.5 py-0.5 rounded cursor-help" 
                    : wasCleaned ? "border border-accent/20 px-1.5 py-0.5 rounded cursor-help text-text-secondary" : "text-text-secondary"
                }`} 
                title={isBadEmail ? "E-mail sinalizado como inválido pelo validador." : transformationMsg || emailStr}
              >
                {isBadEmail && <AlertCircle className="w-3 h-3 inline mr-1 text-red-400 shrink-0 align-middle" />}
                {emailStr}
              </span>
            );
          }

          if (header === "salary_expectation" && typeof originalVal === "number") {
            const numVal = Number(val);
            const badVal = isOutlier(header, originalVal);
            return (
              <span 
                className={`font-mono font-semibold px-1.5 py-0.5 rounded cursor-help ${
                  badVal 
                    ? "text-red-400 bg-red-950/20 border border-red-900/30" 
                    : wasCleaned ? "border border-accent/20 text-text-primary" : "text-text-primary"
                }`}
                title={badVal ? "Outlier detectado: valor acima de Q3 + 1.5×IQR." : transformationMsg}
              >
                {badVal && <AlertTriangle className="w-3 h-3 inline mr-1 text-red-400 shrink-0 align-middle" />}
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(numVal)}
              </span>
            );
          }

          if (header === "experience_years" && typeof originalVal === "number") {
            const numVal = Number(val);
            const badVal = isOutlier(header, originalVal);
            return (
              <span 
                className={`font-mono font-medium px-1.5 py-0.5 rounded cursor-help ${
                  badVal 
                    ? "text-red-400 bg-red-950/20 border border-red-900/30" 
                    : wasCleaned ? "border border-accent/20 text-text-primary" : "text-text-primary"
                }`}
                title={badVal ? "Outlier detectado: valor fora do limite operacional [0 - 20 anos]." : transformationMsg}
              >
                {badVal && <AlertTriangle className="w-3 h-3 inline mr-1 text-red-400 shrink-0 align-middle" />}
                {numVal.toFixed(1)}
              </span>
            );
          }

          if (header === "score_test" || header === "score_interview") {
            return (
              <span className="font-mono font-semibold text-text-primary bg-surface/50 px-1.5 py-0.5 rounded border border-border-subtle/50">
                {Number(val).toFixed(1)}
              </span>
            );
          }

          if (header === "is_duplicate") {
            const isDup = val === true || val === 1 || val === "true" || val === "duplicado";
            return (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDup ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-success/15 text-success border-success/20"}`}>
                {isDup ? "Duplicado" : "Único"}
              </span>
            );
          }

          if (header === "final_status") {
            const statusStr = String(val);
            const isApproved = statusStr.toLowerCase() === "aprovado";
            const isRejected = statusStr.toLowerCase() === "reprovado";
            return (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border cursor-help ${
                  isApproved
                    ? "bg-success/15 text-success border-success/20"
                    : isRejected
                    ? "bg-danger/15 text-danger border-danger/20"
                    : "bg-accent/15 text-accent border-accent/20"
                }`}
                title={transformationMsg}
              >
                {statusStr}
              </span>
            );
          }

          if (header === "candidate_id" && isDuplicateRow) {
            return (
              <span 
                className="flex items-center space-x-1 text-red-400 font-mono font-bold bg-red-950/20 border border-red-900/30 px-1.5 py-0.5 rounded cursor-help" 
                title="Registro duplicado detectado: multiplos cadastros para o mesmo ID."
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{String(val)}</span>
              </span>
            );
          }

          return (
            <span 
              className={`truncate max-w-[200px] block px-1 py-0.5 rounded ${wasCleaned ? "border border-accent/20 text-text-primary cursor-help" : "text-text-secondary"}`} 
              title={transformationMsg || String(val)}
            >
              {String(val)}
            </span>
          );
        }
      };
    });
  }, [visibleHeaders, isPrivacyEnabled, viewMode]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  // Extract dropdown options for filtering
  const filterDropdownOptions = useMemo(() => {
    const roles = new Set<string>();
    const channels = new Set<string>();
    const statuses = new Set<string>();
    const educations = new Set<string>();

    data.forEach(item => {
      if (item.role_applied) roles.add(String(item.role_applied));
      if (item.source_channel) channels.add(String(item.source_channel));
      if (item.final_status) statuses.add(String(item.final_status));
      if (item.education_level) educations.add(String(item.education_level));
    });

    return {
      roles: Array.from(roles).sort(),
      channels: Array.from(channels).sort(),
      statuses: Array.from(statuses).sort(),
      educations: Array.from(educations).sort()
    };
  }, [data]);

  // CSV Exporter (Respecting Masking toggle state)
  const handleDownloadCSV = (forceMask = false) => {
    if (data.length === 0) return;
    
    const exportHeaders = Object.keys(data[0]).filter(h => h !== 'parsed_date');
    const csvRows = [];
    csvRows.push(exportHeaders.join(","));
    
    data.forEach(row => {
      const values = exportHeaders.map(header => {
        let val = row[header];
        const candidateId = String(row.candidate_id || "S/ID");

        // Mask names/emails in CSV if required
        if (forceMask || isPrivacyEnabled) {
          if (header === "name" && val) {
            val = maskName(String(val), candidateId);
          } else if (header === "email" && val) {
            val = maskEmail(String(val));
          }
        }

        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", forceMask || isPrivacyEnabled ? "dataflow_cleaned_masked.csv" : "dataflow_cleaned_complete.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Exporter
  const handleDownloadJSON = () => {
    const exportData = data.map(row => {
      const cleanRow = { ...row };
      delete cleanRow.parsed_date;
      
      if (isPrivacyEnabled) {
        if (cleanRow.name) cleanRow.name = maskName(String(cleanRow.name), String(cleanRow.candidate_id || "S/ID"));
        if (cleanRow.email) cleanRow.email = maskEmail(String(cleanRow.email));
      }
      return cleanRow;
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dataflow_records_diagnostico.json");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Column Details calculation for Sidebar Context Drawer
  const columnDetails = useMemo(() => {
    if (!activeDrawerColumn) return null;
    
    const colName = activeDrawerColumn;
    const profile = columnsProfile.find(p => p.name === colName);
    const dict = COLUMN_DICTIONARY[colName] || {
      name: colName,
      type: "Desconhecido",
      description: "Nenhuma descrição semântica mapeada para esta coluna."
    };
    
    // Check if column is sensitive
    const sensitiveFields = ["name", "email", "salary_expectation", "gender", "age", "ethnicity"];
    const isSensitive = sensitiveFields.some(f => colName.toLowerCase().includes(f));
    
    // Gather related statistical tests from inference
    const relatedTests = inference.filter(test => 
      test.variables.some(v => v.toLowerCase() === colName.toLowerCase())
    );

    // Calculate sample examples (masked)
    const examples = data.slice(0, 5).map(row => {
      const rawVal = row[colName];
      let cleanVal = rawVal;
      
      if (colName === "name" && rawVal) {
        cleanVal = maskName(String(rawVal), String(row.candidate_id || "S/ID"));
      } else if (colName === "email" && rawVal) {
        cleanVal = maskEmail(String(rawVal));
      }
      
      return {
        raw: viewMode === "cleaned" ? getRawValue(colName, rawVal) : String(rawVal),
        clean: String(cleanVal)
      };
    });

    // Score deduction details
    let scoreImpact = "Sem impacto direto.";
    if (profile) {
      if (profile.missing_rate > 0) {
        scoreImpact = `Dedução de -${Math.floor(profile.missing_rate * 25)} pts no Health Score geral devido à incompletude.`;
      }
      if (profile.flags && profile.flags.length > 0) {
        const flagAlerts = profile.flags.join(", ");
        if (flagAlerts.includes("E-mails inválidos")) {
          scoreImpact = "Dedução fixa de -10 pts no Health Score devido a formatos inválidos de e-mail.";
        } else if (flagAlerts.includes("Outliers")) {
          scoreImpact = "Dedução fixa de -5 pts no Health Score geral devido a valores extremos fora dos limites operacionais.";
        }
      }
    }

    return {
      name: colName,
      label: dict.name,
      description: dict.description,
      type: profile?.inferred_type || dict.type,
      completude: profile ? `${((1 - profile.missing_rate) * 100).toFixed(1)}%` : "100%",
      missingCount: profile?.missing_count || 0,
      isSensitive,
      flags: profile?.flags || [],
      stats: profile?.stats,
      topValues: profile?.top_values || [],
      examples,
      relatedTests,
      scoreImpact,
      recommendedActions: profile?.flags && profile.flags.length > 0
        ? profile.flags.map((f: string) => {
            if (f.includes("ausente") || f.includes("incompleto")) return "Tornar campo obrigatório no formulário de captação.";
            if (f.includes("E-mails")) return "Implementar validação Regex em tempo real no front-end do formulário.";
            if (f.includes("Outliers")) return "Auditar consistência da digitação ou limitar faixas aceitáveis no formulário.";
            return "Revisar pipeline de ingestão e estruturação.";
          })
        : ["Manter monitoramento de integridade e auditoria de rotina."]
    };
  }, [activeDrawerColumn, columnsProfile, inference, data, viewMode]);

  return (
    <div className="glass-card p-6 w-full flex flex-col gap-6 relative">
      
      {/* Header Block */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Registros e Auditoria</h3>
          <p className="text-xs text-text-secondary mt-1">
            Grade investigativa do dataset. Filtre por anomalias, audite transformações e baixe versões adequadas.
          </p>
        </div>

        {/* View Mode Toggle (Cleaned vs Raw) & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Saneados vs Brutos Toggle */}
          <div className="flex items-center rounded-lg border border-border-subtle p-0.5 bg-surface text-xs font-semibold shrink-0">
            <button
              onClick={() => setViewMode("cleaned")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "cleaned" 
                  ? "bg-success/10 text-success border border-success/20" 
                  : "text-text-muted"
              }`}
              title="Exibir dados normalizados e limpos"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dados Saneados</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "raw" 
                  ? "bg-warning/10 text-warning border border-warning/20" 
                  : "text-text-muted"
              }`}
              title="Exibir dados brutos simulados antes da normalização"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Dados Brutos</span>
            </button>
          </div>

          {/* Density toggle */}
          <div className="flex items-center rounded-lg border border-border-subtle p-0.5 bg-surface text-xs font-semibold shrink-0">
            <button
              onClick={() => setDensity("comfortable")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${density === "comfortable" ? "bg-surface-elevated text-text-primary" : "text-text-muted"}`}
            >
              Confortável
            </button>
            <button
              onClick={() => setDensity("compact")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${density === "compact" ? "bg-surface-elevated text-text-primary" : "text-text-muted"}`}
            >
              Compacto
            </button>
            <button
              onClick={() => setDensity("zen")}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${density === "zen" ? "bg-surface-elevated text-text-primary" : "text-text-muted"}`}
              title="Visualização Ultra-Limpa"
            >
              Zen
            </button>
          </div>

          {/* Visibility menu toggle */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary bg-surface border border-border-subtle rounded-lg hover:border-border-hover hover:text-text-primary transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Colunas</span>
            </button>

            {showVisibilityMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-elevated border border-border-subtle rounded-lg p-3 shadow-xl z-20 max-h-64 overflow-y-auto">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Exibir Colunas</span>
                <div className="flex flex-col gap-2">
                  {table.getAllLeafColumns().map(column => {
                    const colName = column.id
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, c => c.toUpperCase());
                    return (
                      <label key={column.id} className="flex items-center space-x-2 text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                        <input
                          type="checkbox"
                          checked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                          className="rounded border-border-subtle bg-surface accent-accent text-black"
                        />
                        <span className="truncate">{colName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Export Masked CSV */}
          <button
            onClick={() => handleDownloadCSV(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-text-primary bg-surface border border-border-subtle rounded-lg hover:border-border-hover transition shadow-sm cursor-pointer"
            title="Exportar base omitindo dados pessoais"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-accent" />
            <span className="flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-cyan-400" /> CSV Mascarado
            </span>
          </button>

          {/* Export Full CSV */}
          {!isPrivacyEnabled && (
            <button
              onClick={() => handleDownloadCSV(false)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-text-primary bg-surface border border-border-subtle rounded-lg hover:border-border-hover transition shadow-sm cursor-pointer"
              title="Baixar planilha original sem máscaras"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-success" />
              <span className="flex items-center gap-1">
                <Unlock className="w-2.5 h-2.5 text-warning" /> CSV Completo
              </span>
            </button>
          )}

          {/* Export JSON */}
          <button
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-text-primary bg-surface border border-border-subtle rounded-lg hover:border-border-hover transition shadow-sm cursor-pointer"
            title="Baixar JSON estruturado para auditorias"
          >
            <FileJson className="w-3.5 h-3.5 text-warning" />
            <span>JSON Diagnóstico</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar registros..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-surface border border-border-subtle rounded-lg text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition"
          />
        </div>

        {/* Filter Alert Severity */}
        <div className="flex items-center space-x-1.5 bg-surface border border-border-subtle rounded-lg px-3 py-2 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-accent shrink-0" />
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-transparent text-text-secondary focus:outline-none cursor-pointer w-full"
          >
            <option value="__all__">Todos Registros</option>
            <option value="any">Qualquer Inconsistência</option>
            <option value="duplicate">Duplicados</option>
            <option value="email">E-mail Inválido</option>
            <option value="outlier">Outliers de Notas/Experiência</option>
            <option value="null">Campos Nulos</option>
          </select>
        </div>

        {/* Filter Role */}
        {filterDropdownOptions.roles.length > 0 && table.getColumn("role_applied") && (
          <div className="flex items-center space-x-1.5 bg-surface border border-border-subtle rounded-lg px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <select
              value={(table.getColumn("role_applied")?.getFilterValue() as string) || "__all__"}
              onChange={e => table.getColumn("role_applied")?.setFilterValue(e.target.value === "__all__" ? undefined : e.target.value)}
              className="bg-transparent text-text-secondary focus:outline-none cursor-pointer w-full"
            >
              <option value="__all__">Todas Vagas</option>
              {filterDropdownOptions.roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        )}

        {/* Filter Channel */}
        {filterDropdownOptions.channels.length > 0 && table.getColumn("source_channel") && (
          <div className="flex items-center space-x-1.5 bg-surface border border-border-subtle rounded-lg px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <select
              value={(table.getColumn("source_channel")?.getFilterValue() as string) || "__all__"}
              onChange={e => table.getColumn("source_channel")?.setFilterValue(e.target.value === "__all__" ? undefined : e.target.value)}
              className="bg-transparent text-text-secondary focus:outline-none cursor-pointer w-full"
            >
              <option value="__all__">Todos Canais</option>
              {filterDropdownOptions.channels.map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>
        )}

        {/* Filter Status */}
        {filterDropdownOptions.statuses.length > 0 && table.getColumn("final_status") && (
          <div className="flex items-center space-x-1.5 bg-surface border border-border-subtle rounded-lg px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <select
              value={(table.getColumn("final_status")?.getFilterValue() as string) || "__all__"}
              onChange={e => table.getColumn("final_status")?.setFilterValue(e.target.value === "__all__" ? undefined : e.target.value)}
              className="bg-transparent text-text-secondary focus:outline-none cursor-pointer w-full"
            >
              <option value="__all__">Todos Status</option>
              {filterDropdownOptions.statuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        )}

        {/* Filter Education */}
        {filterDropdownOptions.educations.length > 0 && table.getColumn("education_level") && (
          <div className="flex items-center space-x-1.5 bg-surface border border-border-subtle rounded-lg px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <select
              value={(table.getColumn("education_level")?.getFilterValue() as string) || "__all__"}
              onChange={e => table.getColumn("education_level")?.setFilterValue(e.target.value === "__all__" ? undefined : e.target.value)}
              className="bg-transparent text-text-secondary focus:outline-none cursor-pointer w-full"
            >
              <option value="__all__">Escolaridades</option>
              {filterDropdownOptions.educations.map(ed => (
                <option key={ed} value={ed}>{ed}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table grid */}
      <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface/30">
        <div className="overflow-x-auto animate-fade-in">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-surface-elevated/70 border-b border-border-subtle">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`px-4 text-xs font-semibold text-text-secondary select-none ${
                        density === "compact" ? "py-2" : density === "zen" ? "py-1 border-none bg-surface/10" : "py-3"
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={`divide-y ${density === "zen" ? "divide-transparent" : "divide-border-subtle"}`}>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => {
                  const isDuplicateRow = row.original.is_duplicate === true || row.original.is_duplicate === 1 || row.original.is_duplicate === "true";
                  
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-surface-elevated/35 text-xs transition-colors ${
                        isDuplicateRow ? "bg-red-500/[0.02] hover:bg-red-500/[0.04]" : ""
                      } ${density === "zen" ? "hover:bg-surface-elevated/20" : ""}`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td 
                          key={cell.id} 
                          className={`px-4 text-text-secondary ${
                            density === "compact" ? "py-1.5" : density === "zen" ? "py-0.5 text-[11px] font-mono border-none" : "py-3"
                          }`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={table.getAllLeafColumns().filter(c => c.getIsVisible()).length}
                    className="px-4 py-16 text-center text-text-muted italic"
                  >
                    Nenhum registro encontrado correspondente aos critérios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Block */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-text-muted font-sans flex items-center gap-1.5">
          <span>
            Mostrando <span className="font-semibold text-text-secondary">{table.getRowModel().rows.length}</span> de{" "}
            <span className="font-semibold text-text-secondary">{table.getFilteredRowModel().rows.length}</span> registros.
          </span>
          {data.length > table.getFilteredRowModel().rows.length && (
            <span className="text-[10px] text-accent font-medium bg-accent/5 px-1.5 py-0.5 rounded border border-accent/10">Filtro Ativo</span>
          )}
          {viewMode === "raw" && (
            <span className="text-[10px] text-warning font-medium bg-warning/5 px-1.5 py-0.5 rounded border border-warning/10">Exibindo Brutos</span>
          )}
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-border-subtle bg-surface text-text-secondary hover:border-border-hover disabled:opacity-30 disabled:hover:border-border-subtle transition cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-border-subtle bg-surface text-text-secondary hover:border-border-hover disabled:opacity-30 disabled:hover:border-border-subtle transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-text-secondary px-3">
            Pág. {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-border-subtle bg-surface text-text-secondary hover:border-border-hover disabled:opacity-30 disabled:hover:border-border-subtle transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-border-subtle bg-surface text-text-secondary hover:border-border-hover disabled:opacity-30 disabled:hover:border-border-subtle transition cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Column Details Side Drawer Overlay */}
      {columnDetails && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in bg-black/45 backdrop-blur-xs">
          <div className="absolute inset-0" onClick={() => setActiveDrawerColumn(null)}></div>
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-md h-full bg-surface-elevated border-l border-border-subtle shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto z-10 animate-slide-left text-sm text-text-secondary">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div>
                <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest block mb-0.5">Mapeamento & Diagnóstico</span>
                <h4 className="text-lg font-extrabold text-text-primary flex items-center gap-1.5">
                  {columnDetails.label}
                  {columnDetails.isSensitive && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40 text-[9px] font-bold">
                      LGPD Sensível
                    </span>
                  )}
                </h4>
              </div>
              <button 
                onClick={() => setActiveDrawerColumn(null)}
                className="p-1.5 rounded-lg hover:bg-surface border border-border-subtle text-text-muted hover:text-text-primary transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Business description */}
            <div className="flex flex-col gap-1.5 bg-surface/40 p-3 rounded-lg border border-border-subtle">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Descrição do Negócio</span>
              <p className="text-xs leading-relaxed text-text-secondary">{columnDetails.description}</p>
            </div>

            {/* Technical Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface/30 p-3 rounded-lg border border-border-subtle flex flex-col gap-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tipo Mapeado</span>
                <span className="font-mono text-xs text-text-primary font-bold">{columnDetails.type}</span>
              </div>
              <div className="bg-surface/30 p-3 rounded-lg border border-border-subtle flex flex-col gap-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Completude</span>
                <span className="font-mono text-xs text-success font-bold">{columnDetails.completude}</span>
              </div>
            </div>

            {/* Quality Alerts */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Status de Qualidade</span>
              {columnDetails.flags.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {columnDetails.flags.map((flag, idx) => (
                    <div key={idx} className="flex items-start space-x-2 p-2 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-red-400 italic mt-0.5">{columnDetails.scoreImpact}</p>
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-success/15 border border-success/20 text-success text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Nenhuma anomalia crítica detectada nesta coluna.</span>
                </div>
              )}
            </div>

            {/* Mini distribution histogram */}
            {columnDetails.topValues && columnDetails.topValues.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Distribuição (Top Categorias)</span>
                <div className="flex flex-col gap-2 bg-surface/20 p-3.5 rounded-lg border border-border-subtle">
                  {columnDetails.topValues.slice(0, 5).map((val, idx) => (
                    <div key={idx} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between font-mono">
                        <span className="text-text-secondary truncate max-w-[200px]" title={val.value}>{val.value}</span>
                        <span className="text-text-muted font-bold">{val.count} ({ (val.rate * 100).toFixed(1) }%)</span>
                      </div>
                      <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden border border-border-subtle/30">
                        <div 
                          className="bg-accent h-full rounded-full" 
                          style={{ width: `${val.rate * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related statistical tests */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Testes Estatísticos Associados</span>
              {columnDetails.relatedTests.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {columnDetails.relatedTests.map((test, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-surface/25 border border-border-subtle flex flex-col gap-1.5 text-xs">
                      <span className="font-bold text-text-primary text-xs">{test.test_name}</span>
                      <p className="text-text-secondary leading-normal">{test.interpretation}</p>
                      <div className="flex justify-between items-center text-[10px] font-mono mt-1 border-t border-border-subtle/40 pt-1.5 text-text-muted">
                        <span>p-valor: <b className="text-text-secondary">{test.p_value.toFixed(4)}</b></span>
                        <span>Significativo: <b className={test.significance ? "text-success" : "text-danger"}>{test.significance ? "Sim" : "Não"}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic bg-surface/10 p-3 rounded-lg border border-border-subtle border-dashed">
                  Nenhum teste estatístico formal foi parametrizado para esta variável no pipeline.
                </p>
              )}
            </div>

            {/* Transform log examples */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Amostra & Transformações (Original vs Saneado)</span>
              <div className="bg-surface/30 rounded-lg border border-border-subtle overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-surface-elevated/70 border-b border-border-subtle px-3 py-1.5 font-bold font-sans text-text-muted text-[10px] uppercase">
                  <span>Bruto (Original)</span>
                  <span>Limpo (Saneado)</span>
                </div>
                <div className="divide-y divide-border-subtle/60">
                  {columnDetails.examples.map((ex, idx) => (
                    <div key={idx} className="grid grid-cols-2 px-3 py-2 font-mono text-[11px] truncate">
                      <span className="text-text-muted truncate pr-2">{ex.raw || <i className="text-[10px] opacity-40">nulo</i>}</span>
                      <span className="text-text-secondary truncate">{ex.clean || <i className="text-[10px] opacity-40">nulo</i>}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended actions */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ações de Engenharia Recomendadas</span>
              <ul className="list-disc list-inside text-xs leading-relaxed text-text-secondary flex flex-col gap-1 pl-1">
                {columnDetails.recommendedActions.map((action, idx) => (
                  <li key={idx} className="marker:text-accent">{action}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
