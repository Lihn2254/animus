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
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAnalyses, setLoadingAnalyses] = useState(false)
  const [message, setMessage] = useState("")
  const [saveToStorage, setSaveToStorage] = useState(false)

  useEffect(() => {
    fetchAnalyses()
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
      const file = new File([blob], filename, { type: 'application/pdf' })

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

      // If user opted to save the report, upload to server; otherwise only trigger local download
      if (saveToStorage) {
        const token = localStorage.getItem('token')
        const form = new FormData()
        form.append('file', file)
        form.append('metadata', JSON.stringify(metadata))

        const res = await fetch(`${API_BASE_URL}/reports`, {
          method: 'POST',
          body: form,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          setMessage(err.error || 'Error al guardar el reporte')
        } else {
          setMessage('Reporte generado y guardado correctamente')
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      <p className="mb-4">Selecciona dos o más análisis para generar un reporte combinado en PDF.</p>

      <div className="grid gap-2 mb-4">
        {analyses.length === 0 && <div>No hay análisis guardados.</div>}
        {analyses.map((a) => (
          <label key={a.id} className="flex items-start gap-3 border p-3 rounded">
            <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} />
            <div>
              <div className="font-medium">Análisis #{a.id} - {new Date(a.analysis_date).toLocaleString("es-MX")}</div>
              <div className="text-sm text-gray-600">Sentimiento: {a.sentiment || 'N/A'} • Posts: {a.post_count ?? 'N/A'}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input id="save-report" type="checkbox" checked={saveToStorage} onChange={(e) => setSaveToStorage(e.target.checked)} />
          <label htmlFor="save-report" className="text-sm">Guardar reporte en servidor</label>
        </div>

        <button onClick={handleGenerate} disabled={loading || selected.length < 2} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          {loading ? 'Generando...' : saveToStorage ? 'Generar PDF y guardar' : 'Generar PDF (solo descarga)'}
        </button>
        <button onClick={fetchAnalyses} disabled={loadingAnalyses} className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50">
          {loadingAnalyses ? 'Actualizando...' : 'Refrescar análisis'}
        </button>
      </div>

      {message && <div className="mt-4 text-sm">{message}</div>}
    </div>
  )
}
