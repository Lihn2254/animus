import Image from "next/image";

const kpiCards = [
  {
    label: "Nuevos posts relacionadas",
    value: "5.2k",
    delta: "+8.2%",
    note: "en los últimos 7 días",
  },
  {
    label: "Posts de alto impacto",
    value: "318",
    delta: "+3.1%",
    note: "en los últimos 7 días",
  },
  {
    label: "Indicador de estrés promedio",
    value: "8.9",
    delta: "-0.4",
    note: "Escala 0.0 - 10.0",
  },
  {
    label: "Indicador de positividad",
    value: "7.1",
    delta: "+1.3%",
    note: "Escala 0.0 - 10.0",
  },
];

const weeklyMentions = [
  { day: "Lun", value: 42 },
  { day: "Mar", value: 55 },
  { day: "Mie", value: 61 },
  { day: "Jue", value: 47 },
  { day: "Vie", value: 70 },
  { day: "Sab", value: 38 },
  { day: "Dom", value: 52 },
];

const sentimentBreakdown = [
  { label: "Abrumado", value: 36, color: "bg-rose-400" },
  { label: "Agotado", value: 27, color: "bg-amber-400" },
  { label: "Motivado", value: 19, color: "bg-emerald-400" },
  { label: "Neutral", value: 18, color: "bg-slate-300" },
];

const topThemes = [
  {
    theme: "Entrega de proyectos",
    share: "22%",
    detail: "Acumulación de tareas",
  },
  {
    theme: "Síndrome del impostor",
    share: "18%",
    detail: "Compañeros, competencia y calificación promedio",
  },
  {
    theme: "Falta de sueño",
    share: "15%",
    detail: "Entrega de proyectos como principal factor",
  },
  {
    theme: "Incertidumbre en carrera profesional",
    share: "13%",
    detail: "Despidos e internships",
  },
];

const recentSignals = [
  {
    title: "Pico en posts sobre ansiedad",
    description: "Plazo de exámenes en México",
    time: "hace 6 horas",
    tag: "Alerta",
  },
  {
    title: "Apoyo y compañerismo",
    description: "Los estudiantes comparten tips de estudio",
    time: "hace 1 día",
    tag: "General",
  },
  {
    title: "Dificultad para encontrar interships y prácticas",
    description:
      "Los estudiantes mencionan falta de oportunidades para este periodo",
    time: "hace 2 días",
    tag: "Acción sugerida",
  },
];

const subreddits = [
  { name: "r/taquerosprogramadores", posts: 543, trend: "+8%" },
  { name: "r/mexico", posts: 2776, trend: "-4%" },
  { name: "r/csMajors", posts: 3240, trend: "+6%" },
  { name: "r/programming", posts: 2810, trend: "+3%" },
  { name: "r/learnprogramming", posts: 1990, trend: "+11%" },
  { name: "r/cscareerquestions", posts: 1664, trend: "-2%" },
];

export default function Home() {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold text-slate-900">
                {card.value}
              </p>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                {card.delta}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <div className="pb-6">
              <p className="text-slate-400">Actividad semanal</p>
              <h2 className="text-2xl font-semibold">Posts relacionados</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-3 w-3 rounded-full bg-blue-400" />
              Sentimiento neutral, ligeramente positivo
            </div>
          </div>
          <div className="mt-8 grid grid-cols-7 items-end gap-3">
            {weeklyMentions.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2">
                <div className="relative flex h-36 w-full items-end">
                  <div
                    className="w-full rounded-2xl bg-linear-to-t from-blue-700 to-blue-400"
                    style={{ height: `${item.value}%` }}
                  />
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-500">
                    {item.value}%
                  </div>
                </div>
                <span className="text-xs text-slate-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <p className="text-slate-400">Análisis de sentimiento</p>
          <h2 className="mt-2 text-2xl font-semibold">
            Los estudiantes reportan sentirse:
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {sentimentBreakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-slate-100" />
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
            <p className="font-medium">Nota importante</p>
            <p className="mt-2 text-white/70">
              El estrés repunta poco antes y durante la aplicación de exámenes
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-semibold">Temas destacados</h2>
          <p className="pt-1 text-slate-400">en los últimos 7 días</p>
          <div className="mt-6 space-y-4">
            {topThemes.map((theme) => (
              <div
                key={theme.theme}
                className="rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-slate-800">
                    {theme.theme}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                    {theme.share}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{theme.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <h2 className="mt-2 text-2xl font-semibold">
            Notificaciones relevantes
          </h2>
          <div className="mt-6 space-y-4">
            {recentSignals.map((signal) => (
              <div
                key={signal.title}
                className="rounded-2xl border border-slate-100 bg-white px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-slate-800">
                    {signal.title}
                  </p>
                  <span className="rounded-full bg-blue-600 px-2 py-1 text-sm font-semibold text-white">
                    {signal.tag}
                  </span>
                </div>
                <p className="mt-2 text-slate-500">{signal.description}</p>
                <p className="mt-3 text-sm text-slate-400">{signal.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-slate-400">Cobertura por red social</p>
            <div className="pt-3 pl-1 flex items-center">
              <Image
                src="/Reddit_logo.png"
                alt="Reddit"
                width={40}
                height={40}
              />
              <h2 className="text-2xl font-semibold ml-3">Reddit</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <button className="rounded-full border border-slate-200 px-4 py-2">
              IT
            </button>
            <button className="rounded-full border border-slate-200 px-4 py-2">
              General
            </button>
            <button className="rounded-full border border-slate-200 px-4 py-2">
              Estudiantes
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {subreddits.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {item.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.posts.toLocaleString()} posts indexados
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                {item.trend}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
