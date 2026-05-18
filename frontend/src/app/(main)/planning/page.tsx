"use client";

import { useEffect, useState } from "react";
import { createAnalysisSchedule, getAnalysisSchedules } from "@/app/services/analysis";
import {
  ScheduledAnalysis,
  ScheduledAnalysisRequest,
  ScheduleFrequency,
} from "@/app/types/analysis";

type FrequencyOption = {
  value: ScheduleFrequency;
  label: string;
};

const frequencyOptions: FrequencyOption[] = [
  { value: "semanal", label: "Semanal" },
  { value: "bisemanal", label: "Bisemanal" },
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
];

const weekdayOptions = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const ageRanges = ["18-25", "18-35", "26-35", "36-45", "46-60"];

export default function PlanningPage() {
  const previousMonth = new Date();
  previousMonth.setDate(previousMonth.getDate() - 30);

  const [geographicalRegion, setGeographicalRegion] = useState("Mexico");
  const [startDate, setStartDate] = useState<Date>(previousMonth);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [ageRange, setAgeRange] = useState("18-35");
  const [topics, setTopics] = useState("");
  const [communities, setCommunities] = useState("");
  const [postCount, setPostCount] = useState(50);
  const [includeComments, setIncludeComments] = useState(false);

  const [frequency, setFrequency] = useState<ScheduleFrequency>("semanal");
  const [scheduledDay, setScheduledDay] = useState("Lunes");
  const [scheduledTime, setScheduledTime] = useState("09:00");

  const [schedules, setSchedules] = useState<ScheduledAnalysis[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const formatDateOnly = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseCsvList = (value: string): string[] =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const normalizeCommunities = (value: string): string[] =>
    parseCsvList(value).map((item) => item.replace(/^r\//i, ""));

  const isMonthlySchedule = ["mensual", "trimestral", "semestral"].includes(frequency);

  useEffect(() => {
    if (isMonthlySchedule) {
      if (!/^[0-9]{1,2}$/.test(scheduledDay)) {
        setScheduledDay("1");
      }
    } else if (!weekdayOptions.includes(scheduledDay)) {
      setScheduledDay("Lunes");
    }
  }, [frequency]);

  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const response = await getAnalysisSchedules();
      setSchedules(response.results);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo cargar las programaciones guardadas.");
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const selectedTopics = parseCsvList(topics);
    const selectedCommunities = normalizeCommunities(communities);

    if (selectedTopics.length === 0 && selectedCommunities.length === 0) {
      setErrorMessage("Debes ingresar al menos un tema o una comunidad para programar el análisis.");
      return;
    }

    if (startDate > endDate) {
      setErrorMessage("La fecha de inicio no puede ser mayor a la fecha de fin.");
      return;
    }

    if (isMonthlySchedule) {
      const dayNumber = Number(scheduledDay);
      if (Number.isNaN(dayNumber) || dayNumber < 1 || dayNumber > 28) {
        setErrorMessage("Para este tipo de frecuencia, el día debe ser un número entre 1 y 28.");
        return;
      }
    }

    setSaving(true);

    const request: ScheduledAnalysisRequest = {
      frequency,
      scheduled_day: scheduledDay,
      scheduled_time: scheduledTime,
      geographical_region: geographicalRegion,
      start_date: formatDateOnly(startDate),
      end_date: formatDateOnly(endDate),
      age_range: ageRange,
      topics: selectedTopics,
      communities: selectedCommunities,
      post_count: postCount,
      include_comments: includeComments,
      model: "gemini-3-flash-preview",
    };

    try {
      await createAnalysisSchedule(request);
      setSuccessMessage("Programación guardada correctamente.");
      await fetchSchedules();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar la programación.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/30">
        <div className="pb-6 border-b border-slate-200">
          <p className="text-sm uppercase tracking-widest text-slate-400">Planificación</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Programar análisis automáticos</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Define una programación recurrente y guarda tu configuración en la base de datos. Selecciona frecuencia, día, hora, temas y comunidades.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Detalles de programación</h2>
            <div className="mt-5 grid gap-4">
              <label className="block text-sm font-medium text-slate-700">Frecuencia</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-medium text-slate-700">Día</label>
              {isMonthlySchedule ? (
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={scheduledDay}
                  onChange={(e) => setScheduledDay(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                  placeholder="Día del mes (1-28)"
                />
              ) : (
                <select
                  value={scheduledDay}
                  onChange={(e) => setScheduledDay(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                >
                  {weekdayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              )}

              <label className="block text-sm font-medium text-slate-700">Hora</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Parámetros del análisis</h2>
            <div className="mt-5 grid gap-4">
              <label className="block text-sm font-medium text-slate-700">Región</label>
              <input
                type="text"
                value={geographicalRegion}
                onChange={(e) => setGeographicalRegion(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Fecha inicio</label>
                  <input
                    type="date"
                    value={formatDateOnly(startDate)}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Fecha fin</label>
                  <input
                    type="date"
                    value={formatDateOnly(endDate)}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                  />
                </div>
              </div>

              <label className="block text-sm font-medium text-slate-700">Rango de edad</label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              >
                {ageRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-medium text-slate-700">Número de posts</label>
              <input
                type="number"
                min={10}
                max={100}
                value={postCount}
                onChange={(e) => setPostCount(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />

              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeComments}
                  onChange={(e) => setIncludeComments(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Incluir comentarios en el análisis
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Temas</label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="Ej. ansiedad, depresión"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
            />
            <p className="mt-2 text-xs text-slate-500">Comma-separated keywords for the analysis.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Comunidades</label>
            <input
              type="text"
              value={communities}
              onChange={(e) => setCommunities(e.target.value)}
              placeholder="Ej. programación, saludmental"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
            />
            <p className="mt-2 text-xs text-slate-500">Separa comunidades con comas, sin r/.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Tus programaciones se guardan siempre en la base de datos.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? "Guardando…" : "Guardar programación"}
          </button>
        </div>
      </div>

      <div className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/30">
        <div className="pb-6 border-b border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900">Programaciones guardadas</h2>
          <p className="mt-3 text-sm text-slate-600">
            Revisa tus ejecuciones automáticas y la siguiente fecha estimada de ejecución.
          </p>
        </div>

        <div className="mt-6">
          {loadingSchedules ? (
            <p className="text-sm text-slate-500">Cargando programaciones…</p>
          ) : schedules.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no hay programaciones guardadas.</p>
          ) : (
            <div className="grid gap-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-widest text-slate-400">{schedule.frequency}</p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">
                        {schedule.geographical_region} · {schedule.age_range}
                      </h3>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                      {schedule.scheduled_day} · {schedule.scheduled_time}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400">Temas</p>
                      <p className="mt-1 text-sm text-slate-700">{schedule.topics?.join(", ") || "Ninguno"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400">Comunidades</p>
                      <p className="mt-1 text-sm text-slate-700">{schedule.communities?.join(", ") || "Ninguna"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400">Próxima ejecución</p>
                      <p className="mt-1 text-sm text-slate-700">{schedule.next_run_date ? new Date(schedule.next_run_date).toLocaleString("es-MX") : "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
