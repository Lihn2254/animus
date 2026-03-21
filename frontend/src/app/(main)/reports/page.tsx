"use client";

import { useState } from "react";

type AnalysisMode = "subreddit" | "query";
type PageState = "form" | "loading" | "results";
type SortOption = "Relevancia" | "Recientes" | "Top" | "Controversiales";

const SORT_OPTIONS: SortOption[] = [
  "Relevancia",
  "Recientes",
  "Top",
  "Controversiales",
];

const mockKpis = [
  { label: "Posts analizados", value: "1,240", note: "Últimos 30 días" },
  {
    label: "Nivel de estrés promedio",
    value: "7.8",
    note: "Escala 0.0 – 10.0",
  },
  {
    label: "Nivel de ansiedad promedio",
    value: "6.4",
    note: "Escala 0.0 – 10.0",
  },
  {
    label: "Sentimiento general",
    value: "4.2",
    note: "Escala 0.0 – 10.0",
  },
];

const mockThemes = [
  {
    theme: "Burnout profesional",
    share: "28%",
    detail: "Alta recurrencia en comentarios sobre trabajo remoto",
  },
  {
    theme: "Síndrome del impostor",
    share: "21%",
    detail: "Relacionado con entrevistas técnicas y cambio de trabajo",
  },
  {
    theme: "Incertidumbre laboral",
    share: "17%",
    detail: "Despidos en el sector tecnológico",
  },
  {
    theme: "Salud física y sueño",
    share: "12%",
    detail: "Privación de sueño vinculada a proyectos urgentes",
  },
];

const mockSentiment = [
  { label: "Negativo", value: 48, color: "bg-rose-400" },
  { label: "Neutral", value: 31, color: "bg-slate-300" },
  { label: "Positivo", value: 21, color: "bg-emerald-400" },
];

const mockActivity = [
  { day: "Lun", value: 54 },
  { day: "Mar", value: 68 },
  { day: "Mie", value: 82 },
  { day: "Jue", value: 61 },
  { day: "Vie", value: 75 },
  { day: "Sab", value: 42 },
  { day: "Dom", value: 57 },
];

const mockRecentPosts = [
  {
    title: "Is it normal to feel completely drained after every sprint?",
    author: "u/devmind_99",
    upvotes: "1.2k",
    sentiment: "Negativo",
    sentimentColor: "bg-rose-100 text-rose-700",
    time: "hace 3 horas",
  },
  {
    title: "Finally got an offer after 6 months of rejections – don't give up",
    author: "u/persistence_pays",
    upvotes: "3.4k",
    sentiment: "Positivo",
    sentimentColor: "bg-emerald-100 text-emerald-700",
    time: "hace 8 horas",
  },
  {
    title: "How do you deal with imposter syndrome in senior roles?",
    author: "u/senior_dev_anon",
    upvotes: "876",
    sentiment: "Neutral",
    sentimentColor: "bg-slate-100 text-slate-600",
    time: "hace 1 día",
  },
  {
    title: "Laid off again. Third time in two years. Feeling lost.",
    author: "u/throwaway_career",
    upvotes: "2.1k",
    sentiment: "Negativo",
    sentimentColor: "bg-rose-100 text-rose-700",
    time: "hace 1 día",
  },
];

export default function Reportes() {
  const [pageState, setPageState] = useState<PageState>("form");
  const [mode, setMode] = useState<AnalysisMode>("subreddit");
  const [subredditInput, setSubredditInput] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("Relevancia");

  const currentInput =
    mode === "subreddit" ? subredditInput.trim() : queryInput.trim();

  const resultLabel =
    mode === "subreddit"
      ? `r/${subredditInput || "cscareerquestions"}`
      : `"${queryInput || "burnout developer"}"`;

  const handleSubmit = () => {
    setPageState("loading");
    setTimeout(() => setPageState("results"), 2200);
  };

  const handleNewAnalysis = () => {
    setPageState("form");
    setSubredditInput("");
    setQueryInput("");
    setSaveToProfile(false);
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
            Recuperando y analizando posts de {resultLabel}
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
    return (
      <>
        {/* Results header + action bar */}
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">Resultado del análisis</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                {resultLabel}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Generado el 7 de marzo de 2026 · 14:32 &nbsp;·&nbsp; 1,240
                posts
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Save to profile toggle */}
              <button
                onClick={() => setSaveToProfile(!saveToProfile)}
                className={`flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
                  saveToProfile
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    saveToProfile ? "bg-blue-500" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      saveToProfile ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                Guardar en perfil
              </button>

              {/* Export JSON */}
              <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                  />
                </svg>
                Exportar JSON
              </button>

              {/* Export PDF */}
              <button className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-100">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                Exportar PDF
              </button>

              {/* New analysis */}
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
          </div>
        </div>

        {/* KPI cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mockKpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
            >
              <p className="text-sm text-slate-500">{kpi.label}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">
                {kpi.value}
              </p>
              <p className="mt-2 text-sm text-slate-400">{kpi.note}</p>
            </div>
          ))}
        </section>

        {/* Activity chart + Sentiment breakdown */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between pb-6">
              <div>
                <p className="text-slate-400">Actividad de la última semana</p>
                <h3 className="text-2xl font-semibold">Volumen de posts</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="h-3 w-3 rounded-full bg-blue-400" />
                Posts totales
              </div>
            </div>
            <div className="mt-8 grid grid-cols-7 items-end gap-3">
              {mockActivity.map((item) => (
                <div key={item.day} className="flex flex-col items-center gap-2">
                  <div className="relative flex h-36 w-full items-end">
                    <div
                      className="w-full rounded-2xl bg-linear-to-t from-blue-700 to-blue-400"
                      style={{ height: `${item.value}%` }}
                    />
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-500">
                      {item.value}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <p className="text-slate-400">Análisis de sentimiento</p>
            <h3 className="mt-1 text-2xl font-semibold">
              Distribución general
            </h3>
            <div className="mt-6 flex flex-col gap-5">
              {mockSentiment.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-2xl bg-slate-100" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {item.label}
                      </span>
                      <span className="text-slate-500">{item.value}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-900 p-4 text-white">
              <p className="font-medium">Síntesis del análisis</p>
              <p className="mt-2 text-sm text-white/70">
                Predomina el sentimiento negativo asociado a presión laboral y
                cambios en el mercado tecnológico.
              </p>
            </div>
          </div>
        </section>

        {/* Themes + Recent posts */}
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <h3 className="text-2xl font-semibold">Temas identificados</h3>
            <p className="pt-1 text-slate-400">por frecuencia de aparición</p>
            <div className="mt-6 space-y-3">
              {mockThemes.map((t) => (
                <div
                  key={t.theme}
                  className="rounded-2xl border border-slate-100 bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">{t.theme}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-600">
                      {t.share}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{t.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <h3 className="text-2xl font-semibold">Posts representativos</h3>
            <p className="pt-1 text-slate-400">muestra de los datos recuperados</p>
            <div className="mt-6 space-y-3">
              {mockRecentPosts.map((post) => (
                <div
                  key={post.title}
                  className="rounded-2xl border border-slate-100 bg-white px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-800 leading-snug">
                      {post.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${post.sentimentColor}`}
                    >
                      {post.sentiment}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm text-slate-400">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>▲ {post.upvotes}</span>
                    <span>·</span>
                    <span>{post.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
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
          Solicitar nuevo análisis
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
              {/* Subreddit option */}
              <button
                onClick={() => setMode("subreddit")}
                className={`rounded-2xl border p-4 text-left transition ${
                  mode === "subreddit"
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      mode === "subreddit" ? "bg-blue-100" : "bg-slate-100"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        mode === "subreddit"
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
                        mode === "subreddit"
                          ? "text-blue-900"
                          : "text-slate-800"
                      }`}
                    >
                      Por subreddit
                    </p>
                    <p className="text-sm text-slate-500">
                      Analiza un subreddit específico
                    </p>
                  </div>
                </div>
              </button>

              {/* Query option */}
              <button
                onClick={() => setMode("query")}
                className={`rounded-2xl border p-4 text-left transition ${
                  mode === "query"
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      mode === "query" ? "bg-blue-100" : "bg-slate-100"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${
                        mode === "query" ? "text-blue-600" : "text-slate-500"
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
                        mode === "query" ? "text-blue-900" : "text-slate-800"
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
              <p className="font-semibold">
                {mode === "subreddit"
                  ? "Análisis por subreddit"
                  : "Análisis por búsqueda"}
              </p>
            </div>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              {mode === "subreddit"
                ? "Recupera y analiza los posts más recientes del subreddit indicado. Ideal para comunidades específicas."
                : "Realiza una búsqueda global en Reddit usando los términos indicados. Útil para rastrear temas transversales entre comunidades."}
            </p>
          </div>
        </div>

        {/* ── Form fields ── */}
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-400">Configuración del análisis</p>
          <h3 className="mt-1 text-xl font-semibold">
            {mode === "subreddit"
              ? "Especifica el subreddit"
              : "Especifica la búsqueda"}
          </h3>

          <div className="mt-7 flex flex-col gap-6">
            {/* Primary input */}
            {mode === "subreddit" ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Nombre del subreddit
                </label>
                <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
                  <span className="border-r border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                    r/
                  </span>
                  <input
                    className="flex-1 bg-white px-3 py-3 text-sm text-slate-700 outline-none"
                    placeholder="cscareerquestions"
                    value={subredditInput}
                    onChange={(e) => setSubredditInput(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Ingresa el nombre exacto del subreddit sin el prefijo
                  &quot;r/&quot;
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Palabras clave
                </label>
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder='Ej. "burnout developer mental health"'
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                />
                <p className="text-xs text-slate-400">
                  Puedes usar operadores como AND, OR o comillas para frases
                  exactas
                </p>
              </div>
            )}

            <div className="h-px bg-slate-100" />

            {/* Post limit + time range */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Cantidad de posts
                </label>
                <div className="relative">
                  <select className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400">
                    <option>100 posts</option>
                    <option>250 posts</option>
                    <option>500 posts</option>
                    <option>1,000 posts</option>
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

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Período de tiempo
                </label>
                <div className="relative">
                  <select className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400">
                    <option>Última semana</option>
                    <option>Último mes</option>
                    <option>Últimos 3 meses</option>
                    <option>Último año</option>
                    <option>Todo el tiempo</option>
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
                El tiempo de procesamiento depende de las características del análisis
              </p></div>
              
              <button
                onClick={handleSubmit}
                disabled={!currentInput}
                className="flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Solicitar análisis
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

