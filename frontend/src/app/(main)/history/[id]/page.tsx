'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisHistoryItem } from '../../../types/analysis';
import { getAnalysisById } from '../../../services/analysis';
import { ExportJsonButton } from '@/app/components/export-analysis/ExportJsonButton';
import { ExportPdfButton } from '@/app/components/export-analysis/ExportPdfButton';

export default function AnalysisDetailPage() {
  const [analysis, setAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id as string;

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAnalysisById(parseInt(id));
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el análisis');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchAnalysis();
    }
  }, [id, fetchAnalysis]);

  const formatDate = (dateValue: string) => {
    const date = new Date(dateValue);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  if (loading) return <div className="p-6">Cargando análisis...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!analysis) return <div className="p-6">No se encontró el análisis.</div>;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)]">
        <div className="mb-8 flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">Detalle</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Detalle del análisis</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExportPdfButton
              analysisOverview={{
                id: analysis.id,
                saved: true,
                message: '',
                analysis: {
                  analyzed_posts: analysis.post_count,
                  anxiety_level: analysis.anxiety_level,
                  keywords: analysis.keywords ?? [],
                  model_version: analysis.model_version,
                  sentiment: analysis.sentiment,
                  stress_level: analysis.stress_level,
                  summary: analysis.summary,
                },
              }}
              analysisGeneratedAt={analysis.analysis_date ? new Date(analysis.analysis_date) : null}
              submittedParams={{
                region: analysis.geographical_region ?? 'N/D',
                startDate: analysis.start_date ?? 'N/D',
                endDate: analysis.end_date ?? 'N/D',
                ageRange: analysis.age_range ?? 'N/D',
                topics: analysis.topics ?? [],
                communities: analysis.communities ?? [],
                includeComments: false,
              }}
              analysisMessage=""
            />
            <ExportJsonButton
              analysisOverview={{
                id: analysis.id,
                saved: true,
                message: '',
                analysis: {
                  analyzed_posts: analysis.post_count,
                  anxiety_level: analysis.anxiety_level,
                  keywords: analysis.keywords ?? [],
                  model_version: analysis.model_version,
                  sentiment: analysis.sentiment,
                  stress_level: analysis.stress_level,
                  summary: analysis.summary,
                },
              }}
              analysisGeneratedAt={analysis.analysis_date ? new Date(analysis.analysis_date) : null}
              submittedParams={{
                region: analysis.geographical_region ?? 'N/D',
                startDate: analysis.start_date ?? 'N/D',
                endDate: analysis.end_date ?? 'N/D',
                ageRange: analysis.age_range ?? 'N/D',
                topics: analysis.topics ?? [],
                communities: analysis.communities ?? [],
                includeComments: false,
              }}
              analysisMessage=""
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Parámetros del análisis</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-400">Región</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.geographical_region}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-400">Rango de edad</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.age_range}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-400">Fecha inicio</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.start_date ? formatDate(analysis.start_date) : 'N/A'}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-400">Fecha fin</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.end_date ? formatDate(analysis.end_date) : 'N/A'}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm sm:col-span-2">
                <p className="text-xs uppercase tracking-widest text-slate-400">Temas</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.topics?.join(', ') || 'Ninguno'}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm sm:col-span-2">
                <p className="text-xs uppercase tracking-widest text-slate-400">Comunidades</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.communities?.join(', ') || 'Ninguna'}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-400">Publicaciones</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.post_count}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-slate-400">Fecha de análisis</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.analysis_date ? formatDate(analysis.analysis_date) : 'NA'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-5">Resultados del análisis</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Sentimiento</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.sentiment}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Modelo</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{analysis.model_version}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Estrés</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{(analysis.stress_level * 100).toFixed(1)}%</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Ansiedad</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{(analysis.anxiety_level * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400">Palabras clave</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.keywords.map((keyword, index) => (
                  <span key={index} className="rounded-full bg-sky-100 px-3 py-1 text-sm text-sky-700">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-widest text-slate-400">Resumen</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{analysis.summary}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
