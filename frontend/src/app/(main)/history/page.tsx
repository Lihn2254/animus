'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisHistoryItem } from '../../types/analysis';
import { getAnalysisHistory } from '../../services/analysis';

export default function HistoryPage() {
  const [allAnalyses, setAllAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [visibleAnalyses, setVisibleAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAllHistory();
  }, []);

  useEffect(() => {
    if (allAnalyses.length > 0) {
      const query = filterTopic.trim().toLowerCase();
      const filtered = allAnalyses.filter((item) => {
        const analysisDate = new Date(item.analysis_date);
        const matchesFrom = filterDateFrom ? analysisDate >= new Date(filterDateFrom) : true;
        const matchesTo = filterDateTo ? analysisDate <= new Date(filterDateTo) : true;

        const keywords = [...(item.topics || []), ...(item.communities || [])];
        const matchesTopic = query
          ? keywords.some((keyword) => keyword.toLowerCase().includes(query))
          : true;

        return matchesFrom && matchesTo && matchesTopic;
      });

      const sorted = filtered.sort((a, b) => {
        const dateA = new Date(a.analysis_date).getTime();
        const dateB = new Date(b.analysis_date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });

      setVisibleAnalyses(sorted);
    }
  }, [allAnalyses, filterDateFrom, filterDateTo, filterTopic, sortOrder]);

  const fetchAllHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAnalysisHistory();
      const sortedAnalyses = response.results.sort((a, b) => {
        const dateA = new Date(a.analysis_date).getTime();
        const dateB = new Date(b.analysis_date).getTime();
        return dateB - dateA;
      });

      setAllAnalyses(sortedAnalyses);
      setVisibleAnalyses(sortedAnalyses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = (id: number) => {
    // TODO: Implementar exportación a PDF
    console.log('Exportar PDF para análisis', id);
  };

  const handleExportJSON = (id: number) => {
    // TODO: Implementar exportación a JSON
    console.log('Exportar JSON para análisis', id);
  };

  const getTopicDisplay = (item: AnalysisHistoryItem) => {
    const topics = item.topics || [];
    const communities = item.communities || [];
    return [...topics, ...communities].join(', ') || 'General';
  };

  if (loading) return <div className="p-6">Cargando historial...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/30">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Historial</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Historial de análisis</h1>
          </div>
          <p className="max-w-xl text-sm text-slate-600">
            Aquí puedes revisar tus análisis guardados, filtrar por fechas o tema/comunidad, y ordenar los resultados según la fecha.
          </p>
        </div>

        <div className="mb-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha desde</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha hasta</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tema / comunidad</label>
              <input
                type="text"
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                placeholder="Busca por tema o comunidad"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">Resultados: {visibleAnalyses.length}</p>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700">Ordenar por fecha</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              >
                <option value="desc">Más recientes primero</option>
                <option value="asc">Más antiguos primero</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {visibleAnalyses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
              No se encontraron análisis.
            </div>
          ) : (
            visibleAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/40"
                onClick={() => router.push(`/history/${analysis.id}`)}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">{new Date(analysis.analysis_date).toLocaleDateString()}</span>
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">{analysis.post_count} publicaciones</span>
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">{analysis.sentiment}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">{getTopicDisplay(analysis)}</h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{analysis.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportPDF(analysis.id);
                      }}
                      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Exportar PDF
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportJSON(analysis.id);
                      }}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Exportar JSON
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}