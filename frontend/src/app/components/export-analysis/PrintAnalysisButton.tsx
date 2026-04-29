"use client";

import { jsPDF } from "jspdf";
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

const PRINT_ICON_PATH = "M6 9V2.25h12V9m-12 0h12m-12 0v8.25h12V9m-9 4.5h6";

type Rgb = [number, number, number];

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

export function PrintAnalysisButton(props: ExportButtonProps) {
  const { analysisOverview, analysisGeneratedAt, submittedParams, analysisMessage, disabled = false, className = EXPORT_BUTTON_CLASS } = props;
  const isDisabled = disabled || !analysisOverview?.analysis;

  const handleClick = async () => {
    const doc = await buildStyledPdf({
      analysisOverview,
      analysisGeneratedAt,
      submittedParams,
      analysisMessage,
    });

    if (!doc) return;

    doc.autoPrint();
    const blob = doc.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, "_blank");

    if (!printWindow) {
      alert("No se pudo abrir la vista de impresión.");
    }

    window.setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  };

  return (
    <button type="button" onClick={handleClick} disabled={isDisabled} className={className}>
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={PRINT_ICON_PATH} />
      </svg>
      Imprimir
    </button>
  );
}
