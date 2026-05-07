"use client"

import React, { useEffect, useState } from "react"
import API_BASE_URL from "@/app/api"
import {
  buildReportFileName,
  buildReportPdf,
  computeReportSummary,
  type ReportAnalysis,
} from "@/app/components/export-analysis/ExportPdfButton"

export default function ReportsPage() {
  const [analyses, setAnalyses] = useState<ReportAnalysis[]>([])
  const [savedReports, setSavedReports] = useState<Array<{ id: number; title: string | null; created_at: string | null }>>([])
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAnalyses, setLoadingAnalyses] = useState(false)
  const [loadingReports, setLoadingReports] = useState(false)
  const [message, setMessage] = useState("")
  const [saveToStorage, setSaveToStorage] = useState(false)

  useEffect(() => {
    fetchAnalyses()
    fetchReports()
  }, [])

  async function fetchAnalyses() {
    try {
      setLoadingAnalyses(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE_URL}/analysis`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) return
      const data = await res.json()
      setAnalyses(data.results || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAnalyses(false)
    }
  }

  async function fetchReports() {
    try {
      setLoadingReports(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE_URL}/reports`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) return
      const data = await res.json()
      setSavedReports((data.results || []).map((report: { id: number; title: string | null; created_at: string | null }) => report))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingReports(false)
    }
  }

  function toggle(id: number) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  function downloadPdf(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function handleGenerate() {
    if (selected.length < 2) {
      setMessage("Seleccione al menos 2 análisis para generar el reporte.")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const selectedAnalyses = analyses.filter((a) => selected.includes(a.id))
      const summary = computeReportSummary(selectedAnalyses)
      const createdAt = new Date()
      const doc = await buildReportPdf({ analyses: selectedAnalyses, summary, createdAt })
      const filename = buildReportFileName(createdAt)
      const blob = doc.output('blob')
      const metadata = {
        included_analysis_ids: selectedAnalyses.map((a) => a.id),
        title: `Reporte ${createdAt.toLocaleDateString()}`,
        overall_sentiment: summary.overallSentiment,
        stress_level: summary.stressLevel,
        anxiety_level: summary.anxietyLevel,
        total_posts: summary.totalPosts,
        topics: summary.topics,
        communities: summary.communities,
        created_at: createdAt.toISOString(),
      }

      // If user opted to save the report, send metadata to server; otherwise only trigger local download
      if (saveToStorage) {
        const token = localStorage.getItem('token')
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }

        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const res = await fetch(`${API_BASE_URL}/reports`, {
          method: 'POST',
          body: JSON.stringify(metadata),
          headers,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          setMessage(err.error || 'Error al guardar el reporte')
        } else {
          setMessage('Reporte generado y guardado correctamente')
          await fetchReports()
          downloadPdf(blob, filename)
        }
      } else {
        // Only download locally
        setMessage('Reporte generado (solo descarga)')
        downloadPdf(blob, filename)
      }

    } catch (err) {
      console.error(err)
      setMessage('Error generando el reporte')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadSavedReport(reportId: number) {
    try {
      setLoading(true)
      setMessage("")

      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE_URL}/reports/${reportId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessage(err.error || "Error descargando el reporte")
        return
      }

      const data = await res.json()
      const report = data.report
      const analysesFromDb = (data.analyses || []) as ReportAnalysis[]

      if (!analysesFromDb.length) {
        setMessage("No fue posible reconstruir el reporte porque no se encontraron análisis asociados.")
        return
      }

      const summary = computeReportSummary(analysesFromDb)
      const createdAt = report?.created_at ? new Date(report.created_at) : new Date()
      const doc = await buildReportPdf({ analyses: analysesFromDb, summary, createdAt })
      downloadPdf(doc.output('blob'), buildReportFileName(createdAt))
      setMessage("Reporte descargado correctamente")
    } catch (err) {
      console.error(err)
      setMessage("Error descargando el reporte")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Reportes</h1>
          <p className="text-sm text-slate-400">Selecciona dos o más análisis para generar un reporte combinado en PDF.</p>
        </div>

        <div className="grid gap-3 mb-4">
          {analyses.length === 0 && <div className="text-sm text-slate-500">No hay análisis guardados.</div>}
          {analyses.map((a) => (
            <label key={a.id} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <input className="mt-1" type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} />
              <div>
                <div className="font-medium text-slate-800">Análisis #{a.id} - {new Date(a.analysis_date).toLocaleString("es-MX")}</div>
                <div className="text-sm text-slate-500">Sentimiento: {a.sentiment || 'N/A'} • Posts: {a.post_count ?? 'N/A'}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input id="save-report" type="checkbox" checked={saveToStorage} onChange={(e) => setSaveToStorage(e.target.checked)} />
            <label htmlFor="save-report" className="text-sm text-slate-600">Guardar reporte</label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || selected.length < 2}
            className="rounded-full bg-blue-600 px-4 py-2 text-white font-medium shadow-sm disabled:opacity-50"
          >
            {loading ? 'Generando...' : saveToStorage ? 'Generar PDF y guardar' : 'Generar PDF (solo descarga)'}
          </button>

          <button
            onClick={fetchAnalyses}
            disabled={loadingAnalyses}
            className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 disabled:opacity-50"
          >
            {loadingAnalyses ? 'Actualizando...' : 'Refrescar análisis'}
          </button>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-800">Reportes guardados</h2>
          <button onClick={fetchReports} disabled={loadingReports} className="rounded-full border border-slate-200 px-3 py-2 text-slate-700 disabled:opacity-50">
            {loadingReports ? 'Cargando...' : 'Actualizar reportes'}
          </button>
        </div>

        <div className="mt-3 grid gap-3">
          {savedReports.length === 0 && <div className="text-sm text-slate-500">No hay reportes guardados.</div>}
          {savedReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
              <div>
                <div className="font-medium text-slate-800">{report.title || `Reporte #${report.id}`}</div>
                <div className="text-sm text-slate-500">
                  {report.created_at ? new Date(report.created_at).toLocaleString("es-MX") : "Fecha no disponible"}
                </div>
              </div>
              <button
                onClick={() => handleDownloadSavedReport(report.id)}
                disabled={loading}
                className="rounded-full bg-blue-600 px-4 py-2 text-white font-medium shadow-sm disabled:opacity-50"
              >
                Descargar PDF
              </button>
            </div>
          ))}
        </div>
      </section>

      {message && <div className="mt-4 text-sm text-slate-600">{message}</div>}
    </div>
  )
}
