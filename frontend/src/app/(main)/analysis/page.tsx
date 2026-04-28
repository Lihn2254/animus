"use client";

import ExportAnalysisActions from "@/app/components/ExportAnalysisActions";
import { runAnalysis } from "@/app/services/analysis";
import {
  AnalysisOverview,
  AnalysisRequest,
} from "@/app/types/analysis";
import { useState } from "react";

type AnalysisMode = "communities" | "topics" | "combined";
type PageState = "form" | "loading" | "results";

const normalizeSentiment = (value: string | null | undefined) =>
  (value ?? "")
    .trim()
    .toLowerCase();

type SubmittedParams = {
  region: string;
  startDate: string;
  endDate: string;
  ageRange: string;
  topics: string[];
  communities: string[];
  includeComments: boolean;
};

export default function Reports() {
  const previousMonth = new Date();
  previousMonth.setDate(previousMonth.getDate() - 30);

  const [pageState, setPageState] = useState<PageState>("form");
  const [mode, setMode] = useState<AnalysisMode>("topics");

  // Parámetros para el análisis definidos por el usuario
  const [geoRegion, setGeoRegion] = useState("Mexico");
  const [startDate, setStartDate] = useState<Date>(previousMonth);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [ageRange, setAgeRange] = useState("18-35");
  const [topics, setTopics] = useState("");
  const [communities, setCommunities] = useState("");
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [postCount, setPostCount] = useState(50);
  const [includeComments, setIncludeComments] = useState(false);

  // Datos devueltos por la API
  const [analysisOverview, setAnalysisOverview] =
    useState<AnalysisOverview | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [analysisGeneratedAt, setAnalysisGeneratedAt] = useState<Date | null>(
    null,
  );
  const [submittedParams, setSubmittedParams] =
    useState<SubmittedParams | null>(null);

  const formatDateOnly = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  };

  const parseCsvList = (value: string): string[] =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const normalizeCommunities = (value: string): string[] =>
    parseCsvList(value).map((item) => item.replace(/^r\//i, ""));

  const handleSubmit = async () => {
    const parsedTopics = parseCsvList(topics);
    const parsedCommunities = normalizeCommunities(communities);

    const selectedTopics = mode === "communities" ? [] : parsedTopics;
    const selectedCommunities = mode === "topics" ? [] : parsedCommunities;

    if (selectedTopics.length === 0 && selectedCommunities.length === 0) {
      alert(
        "Debes ingresar al menos una palabra clave o una comunidad para ejecutar el análisis.",
      );
      return;
    }

    if (startDate > endDate) {
      alert("La fecha de inicio no puede ser mayor que la fecha de fin.");
      return;
    }

    setPageState("loading");

    const analysisRequest: AnalysisRequest = {
      geographical_region: geoRegion,
      start_date: formatDateOnly(startDate),
      end_date: formatDateOnly(endDate),
      age_range: ageRange,
      topics: selectedTopics,
      communities: selectedCommunities,
      post_count: postCount,
      save: saveToProfile,
      include_comments: includeComments,
      model: 'gemini-3-flash-preview'
    };

    setSubmittedParams({
      region: analysisRequest.geographical_region,
      startDate: analysisRequest.start_date,
      endDate: analysisRequest.end_date,
      ageRange: analysisRequest.age_range,
      topics: selectedTopics,
      communities: selectedCommunities,
      includeComments,
    });

    try {
      const res = await runAnalysis(analysisRequest);
      setAnalysisOverview(res);
      setAnalysisMessage(res.message ?? "");
      setAnalysisGeneratedAt(new Date());
      setPageState("results");
    } catch (error) {
      console.log(error);
      alert("Ocurrió un error. El análisis no pudo ser ejecutado.");
      setPageState("form");
    }
  };

  const handleNewAnalysis = () => {
    setPageState("form");
    setCommunities("");
    setTopics("");
    setSaveToProfile(false);
    setAnalysisOverview(null);
    setAnalysisMessage("");
    setAnalysisGeneratedAt(null);
    setSubmittedParams(null);
  };

  const renderHintCard = () => {
    switch (mode) {
      case "communities":
        return {
          title: "Análisis por comunidad",
          description:
            "Recupera y analiza los posts más recientes de la comunidad indicada. Ideal para comunidades específicas.",
        };
      case "topics":
        return {
          title: "Análisis por palabras clave",
          description:
            "Realiza una búsqueda global en Reddit usando los términos indicados. Útil para rastrear temas transversales entre comunidades.",
        };
      case "combined":
        return {
          title: "Análisis combinado",
          description:
            "Recupera y analiza posts de temas específicos dentro la comunidad indicada. Ideal para una búsqueda más precisa.",
        };
    }
  };

  /* ───────────────────────── LOADING ───────────────────────── */
  if (pageState === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-blue-500" />
          <svg
            className="h-7 w-7 text-slate-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-xl font-semibold text-slate-800">
            Procesando análisis…
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Recuperando y analizando posts
          </p>
        </div>
        <div className="flex items-center gap-6 rounded-2xl border border-slate-100 bg-white/80 px-8 py-4 text-sm text-slate-500 shadow-sm">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            Scraping de datos
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            Procesamiento NLP
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Generando reporte
          </span>
        </div>
      </div>
    );
  }

  /* ───────────────────────── RESULTS ───────────────────────── */
  if (pageState === "results") {
    const analysis = analysisOverview?.analysis ?? null;
    const sentiment = analysis?.sentiment ?? "sin resultado";
    const sentimentNormalized = normalizeSentiment(sentiment);
    const sentimentLabel =
      sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
    const stressPct =
      typeof analysis?.stress_level === "number"
        ? `${Math.round(analysis.stress_level * 100)}%`
        : "N/D";
    const anxietyPct =
      typeof analysis?.anxiety_level === "number"
        ? `${Math.round(analysis.anxiety_level * 100)}%`
        : "N/D";
    const analyzedPosts = analysis?.analyzed_posts ?? 0;
    const keywordList = analysis?.keywords ?? [];
    const sentimentToneClass =
      sentimentNormalized === "positivo" || sentimentNormalized === "positive"
        ? "bg-emerald-100 text-emerald-700"
        : sentimentNormalized === "negativo" || sentimentNormalized === "negative"
          ? "bg-rose-100 text-rose-700"
          : "bg-amber-100 text-amber-700";
    const sentimentCardClass =
      sentimentNormalized === "positivo" || sentimentNormalized === "positive"
        ? "border-emerald-200 bg-emerald-50/80"
        : sentimentNormalized === "negativo" || sentimentNormalized === "negative"
          ? "border-rose-200 bg-rose-50/80"
          : "border-amber-200 bg-amber-50/80";
    const sentimentValueClass =
      sentimentNormalized === "positivo" || sentimentNormalized === "positive"
        ? "text-emerald-700"
        : sentimentNormalized === "negativo" || sentimentNormalized === "negative"
          ? "text-rose-700"
          : "text-amber-700";

    return (
      <>
        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-slate-400">Resultado del análisis</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                {sentimentLabel}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {analysisGeneratedAt
                  ? `Generado el ${analysisGeneratedAt.toLocaleDateString("es-MX")} · ${analysisGeneratedAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`
                  : "Generado recientemente"}
                {` · ${analyzedPosts} posts analizados`}
              </p>
              {analysisMessage && (
                <p className="mt-2 text-sm text-blue-600">{analysisMessage}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${sentimentToneClass}`}
              >
                Sentimiento: {sentimentLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                Guardado en BD: {analysisOverview?.saved ? "Sí" : "No"}
              </span>
              {analysisOverview?.saved && analysisOverview.id && (
                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                  ID: {analysisOverview.id}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <ExportAnalysisActions
              analysisOverview={analysisOverview}
              analysisGeneratedAt={analysisGeneratedAt}
              submittedParams={submittedParams}
              analysisMessage={analysisMessage}
            />

            <button
              onClick={handleNewAnalysis}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Nuevo análisis
            </button>
          </div>
        </section>

        {!analysis ? (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-[0_12px_30px_rgba(180,83,9,0.08)]">
            <h3 className="text-lg font-semibold">No hay datos de análisis</h3>
            <p className="mt-2 text-sm">
              La respuesta no incluyó el objeto de análisis. Ejecuta nuevamente
              el análisis para obtener resultados detallados.
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className={`rounded-3xl border p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ${sentimentCardClass}`}>
                <p className="text-sm text-slate-500">Sentimiento</p>
                <p className={`mt-4 text-3xl font-semibold ${sentimentValueClass}`}>
                  {sentimentLabel}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Clasificación general
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <p className="text-sm text-slate-500">Nivel de estrés</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">
                  {stressPct}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Escala normalizada
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <p className="text-sm text-slate-500">Nivel de ansiedad</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">
                  {anxietyPct}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Escala normalizada
                </p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <p className="text-sm text-slate-500">Posts analizados</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">
                  {analyzedPosts}
                </p>
                <p className="mt-2 text-sm text-slate-400">Muestra procesada</p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <h3 className="text-2xl font-semibold">Palabras clave</h3>
                <p className="pt-1 text-slate-400">Detectadas por el modelo</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {keywordList.length > 0 ? (
                    keywordList.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No se detectaron palabras clave.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <h3 className="text-2xl font-semibold">Resumen</h3>
                <p className="pt-1 text-slate-400">Síntesis del análisis</p>
                <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white">
                  <p className="leading-relaxed text-white/85">
                    {analysis.summary ||
                      "No se recibió un resumen del análisis."}
                  </p>
                </div>
                <div className="flex items-center mt-6">
                  <p className="text-sm text-slate-400 pr-1">
                    Modelo:
                  </p>
                  <p className="text-sm text-slate-600 font-bold">
                    {analysis.model_version || "N/D"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <h3 className="text-2xl font-semibold">Parámetros usados</h3>
              <p className="pt-1 text-slate-400">Configuración enviada por el usuario</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Región</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {submittedParams?.region || "N/D"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Rango de edad</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {submittedParams?.ageRange || "N/D"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Fecha de inicio</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {submittedParams?.startDate || "N/D"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Fecha de fin</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {submittedParams?.endDate || "N/D"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Temas</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {submittedParams?.topics.length
                      ? submittedParams.topics.join(", ")
                      : "No especificado"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Comunidades</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {submittedParams?.communities.length
                      ? submittedParams.communities.map((community) => `r/${community}`).join(", ")
                      : "No especificado"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Comentarios incluidos</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {submittedParams?.includeComments ? "Sí" : "No"}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </>
    );
  }

  /* ───────────────────────── FORM ───────────────────────── */
  return (
    <>
      {/* Page title */}
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <p className="text-slate-400">Análisis de Reddit</p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Ejecutar nuevo análisis
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Configura los parámetros y obtén resultados generados por el motor de
          análisis de Animus.
        </p>
      </div>

      {/* Mode selector + form */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* ── Mode selector ── */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <p className="text-sm text-slate-400">Tipo de análisis</p>
            <h3 className="mt-1 text-xl font-semibold">Fuente de datos</h3>

            <div className="mt-5 flex flex-col gap-3">
              {/* topics option */}
              <button
                onClick={() => setMode("topics")}
                className={`rounded-2xl border p-4 text-left transition ${
                  mode === "topics"
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      mode === "topics" ? "bg-blue-100" : "bg-slate-100"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        mode === "topics" ? "text-blue-600" : "text-slate-500"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        mode === "topics" ? "text-blue-900" : "text-slate-800"
                      }`}
                    >
                      Por búsqueda
                    </p>
                    <p className="text-sm text-slate-500">
                      Busca posts por palabras clave
                    </p>
                  </div>
                </div>
              </button>

              {/* communities option */}
              <button
                onClick={() => setMode("communities")}
                className={`rounded-2xl border p-4 text-left transition ${
                  mode === "communities"
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      mode === "communities" ? "bg-blue-100" : "bg-slate-100"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        mode === "communities"
                          ? "text-blue-600"
                          : "text-slate-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        mode === "communities"
                          ? "text-blue-900"
                          : "text-slate-800"
                      }`}
                    >
                      Por comunidad
                    </p>
                    <p className="text-sm text-slate-500">
                      Analiza una comunidad específica
                    </p>
                  </div>
                </div>
              </button>

              {/* combined option */}
              <button
                onClick={() => setMode("combined")}
                className={`rounded-2xl border p-4 text-left transition ${
                  mode === "combined"
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      mode === "combined" ? "bg-blue-100" : "bg-slate-100"
                    }`}
                  >
                    <svg
                      className={`h-6 w-6 ${
                        mode === "combined" ? "text-blue-600" : "text-slate-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.5 14.35 9.65 21.5 12 14.35 14.35 12 21.5 9.65 14.35 2.5 12 9.65 9.65Z" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        mode === "combined" ? "text-blue-900" : "text-slate-800"
                      }`}
                    >
                      Combinado
                    </p>
                    <p className="text-sm text-slate-500">
                      Busca posts por palabras clave y por comunidades
                      específicas
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Info / hint card */}
          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
              </div>
              <p className="font-semibold">{renderHintCard().title}</p>
            </div>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              {renderHintCard().description}
            </p>
          </div>
        </div>

        {/* ── Form fields ── */}
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-400">Configuración del análisis</p>
          <h3 className="mt-1 text-xl font-semibold">
            {mode === "communities"
              ? "Especifica la comunidad"
              : mode === "combined"
                ? "Especifica la búsqueda y comunidad"
                : "Especifica la búsqueda"}
          </h3>

          <div className="mt-7 flex flex-col gap-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Región geográfica
                </label>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder="Ej. Mexico"
                  value={geoRegion}
                  onChange={(e) => setGeoRegion(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Rango de edad
                </label>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder="Ej. 18-35"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                />
              </div>
            </div>

            {/* Primary input */}
            {mode === "topics" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Palabras clave
                </label>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder='Ej. "burnout, developer, mental health"'
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                />
                <p className="text-xs text-slate-400">
                  Separa los elementos por comas (,)
                </p>
              </div>
            )}

            {(mode === "communities" || mode === "combined") && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Nombre de la comunidad(es)
                </label>
                <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
                  <span className="border-r border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                    r/
                  </span>
                  <input
                    className="flex-1 bg-white px-3 py-3 text-sm text-slate-700 outline-none"
                    placeholder="cscareerquestions"
                    value={communities}
                    onChange={(e) => setCommunities(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Ingresa el nombre exacto del communities sin el prefijo
                  &quot;r/&quot;
                </p>
              </div>
            )}

            {mode === "combined" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Palabras clave
                </label>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder='Ej. "burnout, developer, mental health"'
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                />
                <p className="text-xs text-slate-400">
                  Separa los elementos por comas (,)
                </p>
              </div>
            )}

            <div className="h-px bg-slate-100" />

            {/* Post limit + date range */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  value={formatDateOnly(startDate)}
                  onChange={(e) =>
                    setStartDate(new Date(`${e.target.value}T00:00:00`))
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  value={formatDateOnly(endDate)}
                  onChange={(e) =>
                    setEndDate(new Date(`${e.target.value}T23:59:59`))
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Cantidad de posts
                </label>
                <div className="relative">
                  <select
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                    value={postCount}
                    onChange={(e) => setPostCount(Number(e.target.value))}
                  >
                    <option value={10}>10 posts</option>
                    <option value={25}>25 posts</option>
                    <option value={50}>50 posts</option>
                    <option value={100}>100 posts</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Checkboxes */}
            <div className="flex flex-col gap-4 pl-3">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="include-comments"
                  checked={includeComments}
                  onChange={(e) => setIncludeComments(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="include-comments"
                  className="text-sm text-slate-700"
                >
                  Incluir análisis de comentarios
                </label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="save-to-profile"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="save-to-profile"
                  className="text-sm text-slate-700"
                >
                  Guardar análisis en la base de datos
                </label>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Submit */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-row gap-4 items-center">
                <svg
                  className="h-10 w-10 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
                <p className="text-sm text-slate-400">
                  El tiempo de procesamiento depende de las características del
                  análisis
                </p>
              </div>

              <button
                onClick={handleSubmit}
                className="flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ejecutar análisis
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
