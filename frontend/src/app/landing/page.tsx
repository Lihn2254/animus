import Link from "next/link";

const values = [
  {
    title: "Misión",
    description:
      "Proteger a la juventud mexicana mediante prevención temprana, analizando lenguaje digital para detectar riesgos de salud mental en tiempo real.",
  },
  {
    title: "Visión",
    description:
      "Ser la plataforma de referencia en México para instituciones educativas y gobiernos que buscan cuidado psicosocial basado en IA y respeto a la anonimidad.",
  },
  {
    title: "Objetivo",
    description:
      "Democratizar la prevención de crisis con una solución tecnológica que identifica señales de riesgo sin exponer identidades personales.",
  },
];

const steps = [
  {
    label: "1. Monitoreo anónimo",
    detail:
      "Nuestro motor recoge señales de redes sociales y foros públicos sin almacenar datos personales, garantizando privacidad total.",
  },
  {
    label: "2. Análisis culturalmente relevante",
    detail:
      "IA especializada en jerga mexicana interpreta mensajes y detecta patrones de riesgo psicosocial y de ideación suicida.",
  },
  {
    label: "3. Alertas preventivas",
    detail:
      "Las instituciones reciben alertas accionables y métricas claras para intervenir antes de una crisis, en un panel seguro y anónimo.",
  },
];

const technologies = [
  "Inteligencia Artificial y NLP",
  "Scraping responsable de fuentes abiertas",
  "Análisis predictivo y Big Data",
  "Modelo entrenado en contexto mexicano",
  "Dashboard web protegido",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.06),_transparent_28%)] px-6 py-8 sm:px-8 lg:px-16">
      <header className="mx-auto flex max-w-7xl flex-col gap-8 rounded-3xl border border-slate-200 bg-white/80 px-6 py-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-600">
            Animus
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Plataforma de IA para prevención de riesgos mentales en jóvenes.
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/login"
            className="rounded-full border border-slate-300 bg-white/90 px-5 py-3 text-slate-700 transition hover:border-sky-400/70 hover:text-sky-700"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-sky-500 px-5 py-3 font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
          >
            Regístrate
          </Link>
        </div>
      </header>

      <section className="mx-auto mt-10 max-w-7xl space-y-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-700">
              Protección, detección y acción preventiva
            </span>
            <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              Analiza el lenguaje digital, detecta señales tempranas y actúa con confianza.
            </h2>
            <p className="max-w-2xl text-slate-600 sm:text-lg">
              Animus es una solución de tecnología social que ayuda a escuelas, universidades y autoridades a identificar riesgos psicosociales con una IA entrenada en la jerga y contexto mexicano.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Crear cuenta institucional
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Acceder a la plataforma
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-slate-900/10">
            <div className="space-y-5">
              <div className="rounded-3xl bg-slate-50 p-6 text-slate-900 shadow-lg shadow-slate-900/5">
                <p className="text-sm uppercase tracking-[0.24em] text-sky-600">Impacto social</p>
                <h3 className="mt-3 text-2xl font-semibold">Monitoreo anónimo en redes</h3>
                <p className="mt-3 text-slate-600">
                  Convierte datos públicos en alertas preventivas sin comprometer la identidad de los estudiantes.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5 text-slate-900">
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-600">Precisión cultural</p>
                  <p className="mt-3 text-sm text-slate-600">
                    IA entrenada para comprender slang y contextos mexicanos.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 text-slate-900">
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-600">Instituciones</p>
                  <p className="mt-3 text-sm text-slate-600">
                    Panel de control para universidades, colegios y gobiernos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {values.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/10"
            >
              <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-4 leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/10">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-600">Cómo funciona</p>
            <h2 className="text-3xl font-semibold text-slate-900">Proceso simple y humanizado</h2>
            <p className="max-w-xl text-slate-600">
              Animus opera sin intervención humana directa en el análisis, entregando información clara para que quienes toman decisiones actúen rápidamente.
            </p>
            <div className="space-y-4 pt-4">
              {steps.map((step) => (
                <div
                  key={step.label}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="font-semibold text-slate-900">{step.label}</p>
                  <p className="mt-2 text-slate-600">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/10">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-600">Tecnologías destacadas</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">IA, scraping y analítica predictiva</h2>
            <ul className="mt-8 space-y-4">
              {technologies.map((tech) => (
                <li key={tech} className="flex gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
                    ✓
                  </span>
                  <p className="text-slate-700">{tech}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-white/95 to-slate-50/95 p-10 shadow-2xl shadow-slate-900/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-600">Ventaja diferencial</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Una herramienta especializada para el contexto mexicano.</h2>
              <p className="mt-4 text-slate-600">
                Animus no es una solución genérica: combina contexto local, anonimato institucional y un flujo de alertas preventivas para apoyar el bienestar juvenil.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
              >
                Comenzar ahora
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-300 px-6 py-3 text-slate-700 transition hover:border-slate-400"
              >
                Ver plataforma
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
