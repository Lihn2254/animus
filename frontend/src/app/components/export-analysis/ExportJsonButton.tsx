"use client";

import type { AnalysisOverview } from "@/app/types/analysis";

type SubmittedParams = {
  region: string;
  startDate: string;
  endDate: string;
  ageRange: string;
  topics: string[];
  communities: string[];
  includeComments: boolean;
};

type ExportButtonProps = {
  analysisOverview: AnalysisOverview | null;
  analysisGeneratedAt: Date | null;
  submittedParams: SubmittedParams | null;
  analysisMessage: string;
  disabled?: boolean;
  className?: string;
};

const EXPORT_BUTTON_CLASS =
  "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const EXPORT_JSON_ICON_PATH = "M12 5.25v13.5m6.75-6.75H5.25";

const buildFileName = (extension: "json") => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `animus-analysis-${stamp}.${extension}`;
};

const buildExportData = ({
  analysisOverview,
  analysisGeneratedAt,
  submittedParams,
  analysisMessage,
}: ExportButtonProps) => {
  const analysis = analysisOverview?.analysis ?? null;

  return {
    exportedAt: new Date().toISOString(),
    generatedAt: analysisGeneratedAt?.toISOString() ?? null,
    message: analysisMessage || null,
    analysisOverview: analysisOverview
      ? {
          id: analysisOverview.id,
          saved: analysisOverview.saved,
        }
      : null,
    analysis: analysis
      ? {
          analyzed_posts: analysis.analyzed_posts,
          anxiety_level: analysis.anxiety_level,
          keywords: analysis.keywords,
          model_version: analysis.model_version,
          sentiment: analysis.sentiment,
          stress_level: analysis.stress_level,
          summary: analysis.summary,
        }
      : null,
    submittedParams,
  };
};

export function ExportJsonButton(props: ExportButtonProps) {
  const { analysisOverview, analysisGeneratedAt, submittedParams, analysisMessage, disabled = false, className = EXPORT_BUTTON_CLASS } = props;
  const isDisabled = disabled || !analysisOverview?.analysis;

  const handleClick = () => {
    const analysis = analysisOverview?.analysis ?? null;
    if (!analysis) return;

    const exportData = buildExportData({
      analysisOverview,
      analysisGeneratedAt,
      submittedParams,
      analysisMessage,
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = buildFileName("json");
    link.click();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <button type="button" onClick={handleClick} disabled={isDisabled} className={className}>
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={EXPORT_JSON_ICON_PATH} />
      </svg>
      Exportar a JSON
    </button>
  );
}
