"use client";

import { jsPDF } from "jspdf";
import type { AnalysisOverview } from "@/app/types/analysis";

export type ReportAnalysis = {
  id: number;
  analysis_date: string;
  topics: string[] | null;
  communities: string[] | null;
  geographical_region: string | null;
  age_range: string | null;
  sentiment: string | null;
  post_count: number | null;
  summary: string | null;
  stress_level?: number | null;
  anxiety_level?: number | null;
};

export type ReportSummary = {
  overallSentiment: string;
  totalPosts: number;
  topics: string[];
  communities: string[];
  stressLevel: number | null;
  anxietyLevel: number | null;
  generalSummary: string;
};

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

type Rgb = [number, number, number];

const EXPORT_BUTTON_CLASS =
  "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const EXPORT_PDF_ICON_PATH = "M12 16.5v-12m0 12 4-4m-4 4-4-4M6 19.5h12";

const formatDateTime = (value: Date | null) => {
  if (!value) return "N/D";

  return `${value.toLocaleDateString("es-MX")} ${value.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const buildFileName = (extension: "pdf") => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `animus-analysis-${stamp}.${extension}`;
};

const normalizeSentiment = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase();

export const computeReportSummary = (analyses: ReportAnalysis[]): ReportSummary => {
  const sentiments: Record<string, number> = {};
  let totalPosts = 0;
  let stressSum = 0;
  let stressCount = 0;
  let anxietySum = 0;
  let anxietyCount = 0;
  const topicsSet = new Set<string>();
  const communitiesSet = new Set<string>();
  const generalSummaryParts: string[] = [];

  analyses.forEach((analysis) => {
    if (analysis.sentiment) sentiments[analysis.sentiment] = (sentiments[analysis.sentiment] || 0) + 1;
    if (analysis.post_count) totalPosts += analysis.post_count;

    if (typeof analysis.stress_level === "number") {
      stressSum += analysis.stress_level;
      stressCount += 1;
    }

    if (typeof analysis.anxiety_level === "number") {
      anxietySum += analysis.anxiety_level;
      anxietyCount += 1;
    }

    analysis.topics?.forEach((topic) => topicsSet.add(topic));
    analysis.communities?.forEach((community) => communitiesSet.add(community));

    if (analysis.summary) {
      generalSummaryParts.push(analysis.summary);
    }
  });

  const sentimentEntries = Object.entries(sentiments);
  const overallSentiment = sentimentEntries.length
    ? sentimentEntries.sort((left, right) => right[1] - left[1])[0][0]
    : "";

  return {
    overallSentiment,
    totalPosts,
    topics: Array.from(topicsSet),
    communities: Array.from(communitiesSet),
    stressLevel: stressCount ? stressSum / stressCount : null,
    anxietyLevel: anxietyCount ? anxietySum / anxietyCount : null,
    generalSummary: generalSummaryParts.length
      ? generalSummaryParts.join(" ")
      : "No se encontró un resumen general consolidado.",
  };
};

type BuildReportPdfInput = {
  analyses: ReportAnalysis[];
  summary: ReportSummary;
  createdAt: Date;
  brandName?: string;
};

export const buildReportPdf = async ({ analyses, summary, createdAt, brandName = "Animus" }: BuildReportPdfInput) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 38;
  const contentWidth = pageWidth - margin * 2;
  const cardRadius = 14;
  const gap = 16;
  let cursorY = margin;
  let logoDataUrl: string | null = null;

  const reportCreatedLabel = createdAt.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const setTextStyle = (size: number, weight: "normal" | "bold", color: Rgb) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const drawCard = (x: number, y: number, w: number, h: number, fill: Rgb) => {
    doc.setFillColor(fill[0], fill[1], fill[2]);
    doc.roundedRect(x, y, w, h, cardRadius, cardRadius, "F");
  };

  const drawPageBackground = () => {
    const pageBg: Rgb = [244, 246, 250];
    doc.setFillColor(pageBg[0], pageBg[1], pageBg[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      drawPageBackground();
    }
  };

  const drawChip = (x: number, y: number, text: string, bg: Rgb, fg: Rgb) => {
    setTextStyle(9, "bold", fg);
    const width = doc.getTextWidth(text) + 16;
    const height = 20;
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.roundedRect(x, y, width, height, 10, 10, "F");
    doc.text(text, x + 8, y + 14);
  };

  const addSectionTitle = (x: number, y: number, title: string, subtitle: string) => {
    setTextStyle(13, "bold", [15, 23, 42]);
    doc.text(title, x, y);
    setTextStyle(9, "normal", [100, 116, 139]);
    doc.text(subtitle, x, y + 13);
  };

  const drawAnalysisHeader = (startY: number, title: string, subtitle: string, metadataChips: Array<{ text: string; bg: Rgb; fg: Rgb }>) => {
    const headerHeight = 128;
    ensureSpace(headerHeight);
    drawCard(margin, startY, contentWidth, headerHeight, [255, 255, 255]);

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 20, startY + 18, 28, 28, 9, 9, "F");

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, "PNG", margin + 21, startY + 19, 26, 26, undefined, "FAST");
      } catch {
        setTextStyle(12, "bold", [255, 255, 255]);
        doc.text("A", margin + 30, startY + 37);
      }
    } else {
      setTextStyle(12, "bold", [255, 255, 255]);
      doc.text("A", margin + 30, startY + 37);
    }

    setTextStyle(13, "bold", [15, 23, 42]);
    doc.text(brandName, margin + 56, startY + 36);

    setTextStyle(9, "normal", [100, 116, 139]);
    doc.text(subtitle, margin + 20, startY + 66);

    setTextStyle(22, "bold", [15, 23, 42]);
    doc.text(title, margin + 20, startY + 92);

    setTextStyle(9, "normal", [100, 116, 139]);
    doc.text(`Generado: ${reportCreatedLabel}`, margin + 20, startY + 108);

    let chipX = margin + contentWidth - 16;
    metadataChips.forEach((chip) => {
      setTextStyle(9, "bold", [15, 23, 42]);
      const chipWidth = doc.getTextWidth(chip.text) + 16;
      chipX -= chipWidth;
      drawChip(chipX, startY + 18, chip.text, chip.bg, chip.fg);
      chipX -= 8;
    });

    return startY + headerHeight + gap;
  };

  const drawMetricsSection = (startY: number, metrics: Array<{ label: string; value: string; note: string; fg?: Rgb }>) => {
    const metricGap = 10;
    const metricCardHeight = 78;
    const metricCardWidth = (contentWidth - metricGap * 3) / 4;
    ensureSpace(metricCardHeight + gap + 4);

    metrics.forEach((card, index) => {
      const x = margin + index * (metricCardWidth + metricGap);
      const y = startY;
      drawCard(x, y, metricCardWidth, metricCardHeight, [255, 255, 255]);
      setTextStyle(9, "normal", [100, 116, 139]);
      doc.text(card.label, x + 12, y + 20);
      setTextStyle(18, "bold", card.fg ?? [15, 23, 42]);
      doc.text(card.value, x + 12, y + 44);
      setTextStyle(8, "normal", [148, 163, 184]);
      doc.text(card.note, x + 12, y + 62);
    });

    return startY + metricCardHeight + gap;
  };

  const drawSummaryPage = () => {
    drawPageBackground();
    const overallSentiment = summary.overallSentiment || "N/D";
    const sentimentNormalized = normalizeSentiment(summary.overallSentiment);
    const isPositive = sentimentNormalized === "positivo" || sentimentNormalized === "positive";
    const isNegative = sentimentNormalized === "negativo" || sentimentNormalized === "negative";
    const sentimentBg: Rgb = isPositive ? [220, 252, 231] : isNegative ? [255, 228, 230] : [254, 243, 199];
    const sentimentFg: Rgb = isPositive ? [21, 128, 61] : isNegative ? [190, 24, 93] : [146, 64, 14];

    cursorY = drawAnalysisHeader(
      cursorY,
      "Reporte consolidado",
      "Resumen general de los análisis seleccionados",
      [
        { text: `Total posts: ${summary.totalPosts}`, bg: [219, 234, 254], fg: [29, 78, 216] },
        { text: `Análisis incluidos: ${analyses.length}`, bg: [241, 245, 249], fg: [71, 85, 105] },
      ],
    );

    cursorY = drawMetricsSection(cursorY, [
      { label: "Sentimiento", value: overallSentiment, note: "Clasificación general", fg: sentimentFg },
      { label: "Nivel de estrés", value: summary.stressLevel !== null ? summary.stressLevel.toFixed(2) : "N/D", note: "Promedio consolidado" },
      { label: "Nivel de ansiedad", value: summary.anxietyLevel !== null ? summary.anxietyLevel.toFixed(2) : "N/D", note: "Promedio consolidado" },
      { label: "Temas detectados", value: String(summary.topics.length), note: "Elementos consolidados" },
    ]);

    const summaryText = summary.generalSummary || "No se encontró un resumen general consolidado.";
    const topicsText = summary.topics.length ? summary.topics.join(", ") : "Sin temas detectados";
    const communitiesText = summary.communities.length
      ? summary.communities.map((community) => `r/${community}`).join(", ")
      : "Sin comunidades detectadas";

    const splitGap = 16;
    const leftWidth = (contentWidth - splitGap) / 2;
    const rightWidth = leftWidth;
    const leftX = margin;
    const rightX = margin + leftWidth + splitGap;
    const bodyTop = cursorY;
    const bodyHeight = 206;

    ensureSpace(bodyHeight + gap);
    drawCard(leftX, bodyTop, leftWidth, bodyHeight, [255, 255, 255]);
    drawCard(rightX, bodyTop, rightWidth, bodyHeight, [255, 255, 255]);

    addSectionTitle(leftX + 16, bodyTop + 26, "Temas y comunidades", "Elementos consolidados del reporte");
    setTextStyle(11, "normal", [51, 65, 85]);
    doc.text("Temas analizados:", leftX + 16, bodyTop + 58);
    setTextStyle(11, "normal", [71, 85, 105]);
    doc.text(doc.splitTextToSize(topicsText, leftWidth - 32), leftX + 16, bodyTop + 78, { lineHeightFactor: 1.5 });

    const communitiesLabelY = bodyTop + 116;
    setTextStyle(11, "normal", [51, 65, 85]);
    doc.text("Comunidades analizadas:", leftX + 16, communitiesLabelY);
    setTextStyle(11, "normal", [71, 85, 105]);
    doc.text(doc.splitTextToSize(communitiesText, leftWidth - 32), leftX + 16, communitiesLabelY + 18, { lineHeightFactor: 1.5 });

    addSectionTitle(rightX + 16, bodyTop + 26, "Resumen general", "Síntesis global del reporte");
    const summaryBoxY = bodyTop + 54;
    const summaryBoxHeight = 124;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(rightX + 12, summaryBoxY, rightWidth - 24, summaryBoxHeight, 10, 10, "F");
    setTextStyle(11, "normal", [241, 245, 249]);
    const visibleSummaryLines = doc.splitTextToSize(summaryText, rightWidth - 48);
    const maxLines = Math.floor((summaryBoxHeight - 26) / 16);
    doc.text(visibleSummaryLines.slice(0, maxLines), rightX + 22, summaryBoxY + 20, { lineHeightFactor: 1.5 });

    setTextStyle(9, "normal", [148, 163, 184]);
    doc.text(`Análisis incluidos: ${analyses.length}`, rightX + 16, bodyTop + 184);

    const analysesWithTopics = analyses.filter((analysis) => (analysis.topics || []).length > 0).length;
    const analysesWithCommunities = analyses.filter((analysis) => (analysis.communities || []).length > 0).length;
    const analysesWithBoth = analyses.filter((analysis) => (analysis.topics || []).length > 0 && (analysis.communities || []).length > 0).length;
    const analysesWithoutSummary = analyses.filter((analysis) => !analysis.summary).length;

    const coverageRows = [
      { label: "Análisis con temas", value: String(analysesWithTopics), percentage: analyses.length ? `${Math.round((analysesWithTopics / analyses.length) * 100)}%` : "N/D" },
      { label: "Análisis con comunidades", value: String(analysesWithCommunities), percentage: analyses.length ? `${Math.round((analysesWithCommunities / analyses.length) * 100)}%` : "N/D" },
      { label: "Análisis con ambos", value: String(analysesWithBoth), percentage: analyses.length ? `${Math.round((analysesWithBoth / analyses.length) * 100)}%` : "N/D" },
      { label: "Sin resumen", value: String(analysesWithoutSummary), percentage: analyses.length ? `${Math.round((analysesWithoutSummary / analyses.length) * 100)}%` : "N/D" },
    ];

    const coverageTableY = bodyTop + bodyHeight + 14;
    const coverageTableHeight = 144;
    ensureSpace(coverageTableHeight + gap);
    drawCard(margin, coverageTableY, contentWidth, coverageTableHeight, [255, 255, 255]);
    addSectionTitle(margin + 16, coverageTableY + 24, "Cobertura del reporte", "Métricas útiles de los análisis incluidos");

    const coverageLabelWidth = 190;
    const coverageValueWidth = 100;
    const coveragePctWidth = contentWidth - 24 - coverageLabelWidth - coverageValueWidth;
    const coverageHeaderY = coverageTableY + 54;

    setTextStyle(9, "bold", [100, 116, 139]);
    doc.text("Indicador", margin + 20, coverageHeaderY);
    doc.text("Valor", margin + 20 + coverageLabelWidth, coverageHeaderY);
    doc.text("%", margin + contentWidth - coveragePctWidth + 8, coverageHeaderY);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin + 12, coverageHeaderY + 6, margin + contentWidth - 12, coverageHeaderY + 6);

    let coverageRowY = coverageHeaderY + 18;
    coverageRows.forEach((row, index) => {
      const rowBg = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
      doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
      doc.rect(margin + 12, coverageRowY, contentWidth - 24, 22, "F");

      setTextStyle(10, "bold", [51, 65, 85]);
      doc.text(row.label, margin + 20, coverageRowY + 15);

      setTextStyle(10, "normal", [71, 85, 105]);
      doc.text(row.value, margin + 20 + coverageLabelWidth, coverageRowY + 15);

      doc.setFillColor(219, 234, 254);
      doc.roundedRect(margin + contentWidth - coveragePctWidth + 4, coverageRowY + 4, 48, 16, 8, 8, "F");
      setTextStyle(8, "bold", [29, 78, 216]);
      doc.text(row.percentage, margin + contentWidth - coveragePctWidth + 12, coverageRowY + 15);

      coverageRowY += 22;
    });

    return coverageTableY + coverageTableHeight + gap;
  };

  const drawDetailPage = (analysis: ReportAnalysis, index: number) => {
    drawPageBackground();

    const sentiment = analysis.sentiment || "N/D";
    const sentimentNormalized = normalizeSentiment(analysis.sentiment);
    const isPositive = sentimentNormalized === "positivo" || sentimentNormalized === "positive";
    const isNegative = sentimentNormalized === "negativo" || sentimentNormalized === "negative";
    const sentimentBg: Rgb = isPositive ? [220, 252, 231] : isNegative ? [255, 228, 230] : [254, 243, 199];
    const sentimentFg: Rgb = isPositive ? [21, 128, 61] : isNegative ? [190, 24, 93] : [146, 64, 14];
    const topicsAndCommunities = [...(analysis.topics || []), ...(analysis.communities || [])];
    const summaryText = analysis.summary || "No se recibió un resumen del análisis.";
    const summaryLines = doc.splitTextToSize(summaryText, contentWidth - 48);

    let localY = margin;
    localY = drawAnalysisHeader(
      localY,
      `Análisis #${analysis.id}`,
      "Detalle individual usado para consolidar el reporte",
      [
        { text: `Sentimiento: ${sentiment}`, bg: sentimentBg, fg: sentimentFg },
        { text: `Fecha: ${analysis.analysis_date || "N/D"}`, bg: [241, 245, 249], fg: [71, 85, 105] },
      ],
    );

    localY = drawMetricsSection(localY, [
      { label: "Sentimiento", value: sentiment, note: "Clasificación del análisis", fg: sentimentFg },
      { label: "Nivel de estrés", value: analysis.stress_level !== null && typeof analysis.stress_level === "number" ? analysis.stress_level.toFixed(2) : "N/D", note: "Escala normalizada" },
      { label: "Nivel de ansiedad", value: analysis.anxiety_level !== null && typeof analysis.anxiety_level === "number" ? analysis.anxiety_level.toFixed(2) : "N/D", note: "Escala normalizada" },
      { label: "Posts analizados", value: String(analysis.post_count ?? 0), note: "Muestra procesada" },
    ]);

    const leftWidth = (contentWidth - 12) * 0.44;
    const rightWidth = contentWidth - 12 - leftWidth;
    const leftX = margin;
    const rightX = margin + leftWidth + 12;
    const leftHeight = Math.max(180, 90 + Math.max(1, topicsAndCommunities.length) * 20);
    const rightHeight = Math.max(180, 80 + summaryLines.length * 14);

    ensureSpace(Math.max(leftHeight, rightHeight) + gap);
    drawCard(leftX, localY, leftWidth, Math.max(leftHeight, rightHeight), [255, 255, 255]);
    drawCard(rightX, localY, rightWidth, Math.max(leftHeight, rightHeight), [255, 255, 255]);

    addSectionTitle(leftX + 16, localY + 26, "Datos del análisis", "Parámetros ejecutados");
    setTextStyle(10, "normal", [51, 65, 85]);
    const detailLines = [
      `Fecha de ejecución: ${analysis.analysis_date || "N/D"}`,
      `Región: ${analysis.geographical_region || "N/D"}`,
      `Rango de edad: ${analysis.age_range || "N/D"}`,
      `Temas y/o comunidades: ${topicsAndCommunities.length ? topicsAndCommunities.join(", ") : "N/D"}`,
    ];
    doc.text(doc.splitTextToSize(detailLines.join("\n"), leftWidth - 32), leftX + 16, localY + 56);

    addSectionTitle(rightX + 16, localY + 26, "Resumen", "Síntesis del análisis individual");
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(rightX + 12, localY + 52, rightWidth - 24, Math.max(leftHeight, rightHeight) - 76, 10, 10, "F");
    setTextStyle(10, "normal", [241, 245, 249]);
    const visibleSummaryLines = doc.splitTextToSize(summaryText, rightWidth - 48);
    const maxLines = Math.floor((Math.max(leftHeight, rightHeight) - 100) / 14);
    doc.text(visibleSummaryLines.slice(0, maxLines), rightX + 22, localY + 72, { lineHeightFactor: 1.4 });

    setTextStyle(8, "normal", [148, 163, 184]);
    doc.text(`Modelo: ${analysis.summary ? "Incluido en resumen" : "N/D"}`, rightX + 16, localY + Math.max(leftHeight, rightHeight) - 14);

    return localY + Math.max(leftHeight, rightHeight) + gap;
  };

  logoDataUrl = await loadLogoDataUrl();
  drawSummaryPage();

  analyses.forEach((analysis, index) => {
    doc.addPage();
    cursorY = margin;
    drawDetailPage(analysis, index);
  });

  return doc;
};

export const buildReportFileName = (createdAt = new Date()) => {
  const stamp = createdAt.toISOString().replace(/[:.]/g, "-");
  return `animus-report-${stamp}.pdf`;
};

let logoDataUrlCache: string | null | undefined = undefined;

const loadLogoDataUrl = async () => {
  if (logoDataUrlCache !== undefined) return logoDataUrlCache;
  if (typeof window === "undefined") return null;

  return new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        logoDataUrlCache = null;
        resolve(null);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      logoDataUrlCache = dataUrl;
      resolve(dataUrl);
    };

    img.onerror = () => {
      logoDataUrlCache = null;
      resolve(null);
    };
    img.src = "/logo_white.png";
  });
};

const buildStyledPdf = async ({ analysisOverview, analysisGeneratedAt, submittedParams }: ExportButtonProps) => {
  const analysis = analysisOverview?.analysis ?? null;
  if (!analysis) return null;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 38;
  const contentWidth = pageWidth - margin * 2;
  const cardRadius = 14;
  const gap = 16;
  let cursorY = margin;
  const logoDataUrl = await loadLogoDataUrl();

  const stressPct = `${Math.round((analysis.stress_level || 0) * 100)}%`;
  const anxietyPct = `${Math.round((analysis.anxiety_level || 0) * 100)}%`;
  const sentimentLabel = analysis.sentiment || "N/D";
  const sentimentNormalized = normalizeSentiment(analysis.sentiment);
  const isPositive = sentimentNormalized === "positivo" || sentimentNormalized === "positive";
  const isNegative = sentimentNormalized === "negativo" || sentimentNormalized === "negative";

  const setTextStyle = (size: number, weight: "normal" | "bold", color: Rgb) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const drawCard = (x: number, y: number, w: number, h: number, fill: Rgb) => {
    doc.setFillColor(fill[0], fill[1], fill[2]);
    doc.roundedRect(x, y, w, h, cardRadius, cardRadius, "F");
  };

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
  };

  const drawChip = (x: number, y: number, text: string, bg: Rgb, fg: Rgb) => {
    setTextStyle(9, "bold", fg);
    const width = doc.getTextWidth(text) + 16;
    const height = 20;
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.roundedRect(x, y, width, height, 10, 10, "F");
    doc.text(text, x + 8, y + 14);
  };

  const addSectionTitle = (x: number, y: number, title: string, subtitle: string) => {
    setTextStyle(13, "bold", [15, 23, 42]);
    doc.text(title, x, y);
    setTextStyle(9, "normal", [100, 116, 139]);
    doc.text(subtitle, x, y + 13);
  };

  const drawPageBackground = () => {
    const pageBg: Rgb = [244, 246, 250];
    doc.setFillColor(pageBg[0], pageBg[1], pageBg[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  const drawHeaderSection = (startY: number) => {
    const headerHeight = 128;
    ensureSpace(headerHeight);
    drawCard(margin, startY, contentWidth, headerHeight, [255, 255, 255]);

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 20, startY + 18, 28, 28, 9, 9, "F");

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, "PNG", margin + 21, startY + 19, 26, 26, undefined, "FAST");
      } catch {
        setTextStyle(12, "bold", [255, 255, 255]);
        doc.text("A", margin + 30, startY + 37);
      }
    } else {
      setTextStyle(12, "bold", [255, 255, 255]);
      doc.text("A", margin + 30, startY + 37);
    }

    setTextStyle(13, "bold", [15, 23, 42]);
    doc.text("Animus", margin + 56, startY + 36);

    setTextStyle(9, "normal", [100, 116, 139]);
    doc.text("Resultado del análisis", margin + 20, startY + 66);

    setTextStyle(22, "bold", [15, 23, 42]);
    doc.text(sentimentLabel, margin + 20, startY + 92);

    setTextStyle(9, "normal", [100, 116, 139]);
    doc.text(
      `Generado: ${formatDateTime(analysisGeneratedAt)} - ${analysis.analyzed_posts ?? 0} posts`,
      margin + 20,
      startY + 108,
    );

    const chipY = startY + 18;
    let chipX = margin + contentWidth - 16;

    const sentimentBg: Rgb = isPositive ? [220, 252, 231] : isNegative ? [255, 228, 230] : [254, 243, 199];
    const sentimentFg: Rgb = isPositive ? [21, 128, 61] : isNegative ? [190, 24, 93] : [146, 64, 14];

    const dbLabel = `Guardado en BD: ${analysisOverview?.saved ? "Sí" : "No"}`;
    const sentimentChip = `Sentimiento: ${sentimentLabel}`;

    setTextStyle(9, "bold", [15, 23, 42]);
    const dbWidth = doc.getTextWidth(dbLabel) + 16;
    const sentimentWidth = doc.getTextWidth(sentimentChip) + 16;

    chipX -= dbWidth;
    drawChip(chipX, chipY, dbLabel, [241, 245, 249], [71, 85, 105]);
    chipX -= sentimentWidth + 8;
    drawChip(chipX, chipY, sentimentChip, sentimentBg, sentimentFg);

    if (analysisOverview?.id) {
      setTextStyle(9, "bold", [15, 23, 42]);
      const idLabel = `ID: ${analysisOverview.id}`;
      const idWidth = doc.getTextWidth(idLabel) + 16;
      chipX -= idWidth + 8;
      drawChip(chipX, chipY, idLabel, [219, 234, 254], [29, 78, 216]);
    }

    return startY + headerHeight + gap;
  };

  const drawMetricsSection = (startY: number) => {
    const metricGap = 10;
    const metricCardHeight = 78;
    const metricCardWidth = (contentWidth - metricGap * 3) / 4;
    ensureSpace(metricCardHeight + gap + 4);

    const metricCards = [
      { label: "Sentimiento", value: sentimentLabel, note: "Clasificación general" },
      { label: "Nivel de estrés", value: stressPct, note: "Escala normalizada" },
      { label: "Nivel de ansiedad", value: anxietyPct, note: "Escala normalizada" },
      { label: "Posts analizados", value: String(analysis.analyzed_posts ?? 0), note: "Muestra procesada" },
    ];

    metricCards.forEach((card, index) => {
      const x = margin + index * (metricCardWidth + metricGap);
      const y = startY;
      drawCard(x, y, metricCardWidth, metricCardHeight, [255, 255, 255]);
      setTextStyle(9, "normal", [100, 116, 139]);
      doc.text(card.label, x + 12, y + 20);
      setTextStyle(18, "bold", [15, 23, 42]);
      doc.text(card.value, x + 12, y + 44);
      setTextStyle(8, "normal", [148, 163, 184]);
      doc.text(card.note, x + 12, y + 62);
    });

    return startY + metricCardHeight + gap;
  };

  const drawKeywordsAndSummarySection = (startY: number) => {
    const keywords = analysis.keywords.length > 0 ? analysis.keywords : ["Sin palabras clave"];
    const summaryText = analysis.summary || "No se recibió un resumen del análisis.";
    const summaryLines = doc.splitTextToSize(summaryText, contentWidth / 2 - 56);
    const splitGap = 12;
    const leftWidth = (contentWidth - splitGap) * 0.46;
    const rightWidth = contentWidth - splitGap - leftWidth;
    const leftX = margin;
    const rightX = margin + leftWidth + splitGap;

    const estimateKeywordHeight = (() => {
      let rowY = 56;
      let rowX = leftX + 16;
      const rowLimit = leftX + leftWidth - 16;

      keywords.forEach((keyword) => {
        setTextStyle(9, "normal", [51, 65, 85]);
        const chipW = doc.getTextWidth(keyword) + 16;
        if (rowX + chipW > rowLimit) {
          rowX = leftX + 16;
          rowY += 24;
        }
        rowX += chipW + 8;
      });

      return Math.max(150, rowY + 40);
    })();

    const summaryPanelHeight = Math.max(180, 80 + summaryLines.length * 14);
    const middleSectionHeight = Math.max(estimateKeywordHeight, summaryPanelHeight);

    ensureSpace(middleSectionHeight + gap);
    drawCard(leftX, startY, leftWidth, middleSectionHeight, [255, 255, 255]);
    drawCard(rightX, startY, rightWidth, middleSectionHeight, [255, 255, 255]);

    addSectionTitle(leftX + 16, startY + 26, "Palabras clave", "Detectadas por el modelo");
    let keywordRowY = startY + 56;
    let keywordX = leftX + 16;
    const keywordRightLimit = leftX + leftWidth - 16;
    keywords.forEach((keyword) => {
      setTextStyle(9, "normal", [51, 65, 85]);
      const chipW = doc.getTextWidth(keyword) + 16;
      if (keywordX + chipW > keywordRightLimit) {
        keywordX = leftX + 16;
        keywordRowY += 24;
      }
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(keywordX, keywordRowY, chipW, 20, 10, 10, "FD");
      doc.setTextColor(51, 65, 85);
      doc.text(keyword, keywordX + 8, keywordRowY + 14);
      keywordX += chipW + 8;
    });

    addSectionTitle(rightX + 16, startY + 26, "Resumen", "Síntesis del análisis");
    const summaryBoxY = startY + 52;
    const summaryBoxHeight = middleSectionHeight - 76;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(rightX + 12, summaryBoxY, rightWidth - 24, summaryBoxHeight, 10, 10, "F");
    setTextStyle(10, "normal", [241, 245, 249]);
    const visibleSummaryLines = doc.splitTextToSize(summaryText, rightWidth - 48);
    const maxLines = Math.floor((summaryBoxHeight - 24) / 14);
    doc.text(visibleSummaryLines.slice(0, maxLines), rightX + 22, summaryBoxY + 20, { lineHeightFactor: 1.4 });

    setTextStyle(8, "normal", [148, 163, 184]);
    doc.text(`Modelo: ${analysis.model_version || "N/D"}`, rightX + 16, startY + middleSectionHeight - 14);

    return startY + middleSectionHeight + gap;
  };

  const drawParamsSection = (startY: number) => {
    const paramsTitleHeight = 40;
    const paramCardHeight = 56;
    const paramGridGap = 10;
    const paramCardWidth = (contentWidth - paramGridGap * 2 - 32) / 2;
    const paramsHeight = paramsTitleHeight + paramCardHeight * 3 + paramGridGap * 2 + 36;
    ensureSpace(paramsHeight);
    drawCard(margin, startY, contentWidth, paramsHeight, [255, 255, 255]);

    addSectionTitle(margin + 16, startY + 26, "Parámetros usados", "Configuración enviada por el usuario");

    const paramValues = [
      { label: "REGION", value: submittedParams?.region || "N/D" },
      { label: "RANGO DE EDAD", value: submittedParams?.ageRange || "N/D" },
      { label: "FECHA DE INICIO", value: submittedParams?.startDate || "N/D" },
      { label: "FECHA DE FIN", value: submittedParams?.endDate || "N/D" },
      {
        label: "TEMAS",
        value: submittedParams?.topics.length ? submittedParams.topics.join(", ") : "No especificado",
      },
      {
        label: "COMUNIDADES",
        value: submittedParams?.communities.length
          ? submittedParams.communities.map((community) => `r/${community}`).join(", ")
          : "No especificado",
      },
    ];

    paramValues.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + 16 + col * (paramCardWidth + paramGridGap);
      const y = startY + 52 + row * (paramCardHeight + paramGridGap);
      drawCard(x, y, paramCardWidth, paramCardHeight, [248, 250, 252]);
      setTextStyle(8, "normal", [148, 163, 184]);
      doc.text(item.label, x + 12, y + 16);
      setTextStyle(10, "bold", [51, 65, 85]);
      const lines = doc.splitTextToSize(item.value, paramCardWidth - 24).slice(0, 2);
      doc.text(lines, x + 12, y + 34);
    });

    setTextStyle(8, "normal", [148, 163, 184]);
    doc.text(
      `Modelo: ${analysis.model_version || "N/D"} - Comentarios incluidos: ${submittedParams?.includeComments ? "Si" : "No"}`,
      margin + 16,
      startY + paramsHeight - 12,
    );
  };

  drawPageBackground();
  cursorY = drawHeaderSection(cursorY);
  cursorY = drawMetricsSection(cursorY);
  cursorY = drawKeywordsAndSummarySection(cursorY);
  drawParamsSection(cursorY);

  return doc;
};

export function ExportPdfButton(props: ExportButtonProps) {
  const { analysisOverview, analysisGeneratedAt, submittedParams, disabled = false, className = EXPORT_BUTTON_CLASS } = props;
  const isDisabled = disabled || !analysisOverview?.analysis;

  const handleClick = async () => {
    const doc = await buildStyledPdf({
      analysisOverview,
      analysisGeneratedAt,
      submittedParams,
      analysisMessage: props.analysisMessage,
      disabled,
      className,
    });

    if (!doc) return;

    doc.save(buildFileName("pdf"));
  };

  return (
    <button type="button" onClick={handleClick} disabled={isDisabled} className={className}>
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={EXPORT_PDF_ICON_PATH} />
      </svg>
      Exportar a PDF
    </button>
  );
}
