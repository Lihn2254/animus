'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  IconTarget,
  IconLock,
  IconBolt,
  IconHands,
  IconRobot,
  IconTrendingUp,
  IconDatabase,
  IconShield,
  IconMexico,
  IconPhone,
  IconSparkles,
  IconTwitter,
  IconInstagram,
  IconLinkedin,
  IconFacebook,
  IconYoutube,
} from '../components/Icons';

const Brain3D = dynamic(() => import('../components/Brain3DModel'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-linear-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center">
      <div className="text-slate-500">Cargando modelo 3D...</div>
    </div>
  ),
});

const stats = [
  {
    number: '31M',
    label: 'Jóvenes en riesgo',
    detail: 'de 15 a 29 años en México',
  },
  {
    number: '5.35M',
    label: 'Población estudiantil',
    detail: 'en educación superior',
  },
  {
    number: '4,336',
    label: 'Instituciones educativas',
    detail: 'públicas y privadas',
  },
  {
    number: '3ra causa',
    label: 'Suicidio en jóvenes',
    detail: 'en México según INEGI 2023',
  },
];

const impacts = [
  {
    title: 'Precisión Cultural',
    description: 'Única IA entrenada en jerga y contexto mexicano para detectar ideación suicida',
    icon: 'target',
  },
  {
    title: 'Privacidad 100%',
    description: 'Monitoreo anónimo sin almacenar identificadores personales, respetando LFPDPPP',
    icon: 'lock',
  },
  {
    title: 'Tiempo Real',
    description: 'Alertas preventivas inmediatas para que instituciones intervengan antes de crisis',
    icon: 'bolt',
  },
  {
    title: 'Equidad Social',
    description: 'Democratiza diagnósticos de salud mental para poblaciones vulnerables y sin recursos',
    icon: 'hands',
  },
  {
    title: 'Automatización',
    description: 'Procesa volúmenes masivos imposibles de analizar manualmente por humanos',
    icon: 'robot',
  },
  {
    title: 'Escalabilidad',
    description: 'Arquitectura cloud permite crecer de una institución a redes estatales sin reestructurar',
    icon: 'trending',
  },
];

const advantages = [
  {
    title: 'vs Bing genéricas (Bark, Securly)',
    description: 'No comprenden contexto mexicano ni dialectos locales',
    highlight: 'Animus: Entrenamiento específico en lenguaje de jóvenes mexicanos',
  },
  {
    title: 'vs Métodos tradicionales',
    description: 'Encuestas y reportes manuales ignoran el 95% de señales digitales',
    highlight: 'Animus: Análisis de redes públicas sin intervención humana',
  },
  {
    title: 'vs Plataformas genéricas',
    description: 'Social Listening para marketing no detecta riesgo clínico real',
    highlight: 'Animus: Especializado exclusivamente en detección de riesgo psicosocial',
  },
];

const values = [
  {
    title: 'Misión',
    description:
      'Proteger a la juventud mexicana mediante prevención temprana, analizando lenguaje digital para detectar riesgos de salud mental en tiempo real.',
  },
  {
    title: 'Visión',
    description:
      'Ser la plataforma de referencia en México para instituciones educativas y gobiernos que buscan cuidado psicosocial basado en IA y respeto a la anonimidad.',
  },
  {
    title: 'Objetivo',
    description:
      'Democratizar la prevención de crisis con una solución tecnológica que identifica señales de riesgo sin exponer identidades personales.',
  },
];

const steps = [
  {
    label: '1. Monitoreo anónimo',
    detail:
      'Nuestro motor recoge señales de redes sociales y foros públicos sin almacenar datos personales, garantizando privacidad total.',
  },
  {
    label: '2. Análisis culturalmente relevante',
    detail:
      'IA especializada en jerga mexicana interpreta mensajes y detecta patrones de riesgo psicosocial y de ideación suicida.',
  },
  {
    label: '3. Alertas preventivas',
    detail:
      'Las instituciones reciben alertas accionables y métricas claras para intervenir antes de una crisis, en un panel seguro y anónimo.',
  },
];

const technologies = [
  'Inteligencia Artificial y NLP',
  'Scraping responsable de fuentes abiertas',
  'Análisis predictivo y Big Data',
  'Modelo entrenado en contexto mexicano',
  'Dashboard web protegido',
];

const marketData = [
  { label: 'Mercado eHealth 2024', value: '$2.175B', growth: '14.94% anual' },
  { label: 'Proyección 2034', value: '$8.9B', growth: '14.91% CAGR' },
  { label: 'Instituciones objetivo', value: '4,336 IES', detail: 'en todo México' },
  { label: 'Población estudiantil', value: '5.35M', detail: 'potencial beneficiaria' },
];

export default function LandingPage() {
  return (
    <>
      <main className="min-h-screen bg-white px-6 pt-8 pb-20 sm:px-8 lg:px-16">
        {/* Header animado */}
        <header className="mx-auto flex max-w-7xl flex-col gap-8 rounded-3xl border border-slate-200 bg-white/80 px-6 py-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
          <div className="flex items-center gap-4">
            <img src="/logo_black.svg" alt="Animus Logo" className="h-16 w-16 shrink-0 animate-float" />
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-[0.32em] animate-slide-in-left"
                style={{ color: '#000123' }}
              >
                Animus
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl animate-slide-in-right">
                Plataforma de IA para prevención de riesgos mentales en jóvenes.
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3 text-sm w-40">
            <Link
              href="/login"
              className="w-full rounded-full border border-slate-300 bg-white/90 px-5 py-3 text-slate-700 transition hover:border-sky-400/70 hover:text-sky-700 hover:shadow-lg"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="w-full rounded-full bg-sky-500 px-5 py-3 font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 hover:shadow-xl"
            >
              Regístrate
            </Link>
          </div>
        </header>

        <section className="mx-auto mt-10 max-w-7xl space-y-10">
          {/* Sección principal con Brain 3D e imagen */}
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6 bg-linear-to-br from-sky-50 to-blue-50 p-8 rounded-4xl border border-sky-200 animate-slide-in-left stagger-1">
              <span className="inline-flex rounded-full bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-700">
                Protección, detección y acción preventiva
              </span>
              <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                Analiza el lenguaje digital, detecta señales tempranas y actúa con confianza.
              </h2>
              <p className="max-w-2xl text-slate-600 sm:text-lg">
                Animus es una solución de tecnología social que ayuda a escuelas, universidades y autoridades a
                identificar riesgos psicosociales con una IA entrenada en la jerga y contexto mexicano.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 hover:shadow-lg"
                >
                  Crear cuenta institucional
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
                >
                  Acceder a la plataforma
                </Link>
              </div>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white/90 p-4 shadow-2xl shadow-slate-900/10 animate-slide-in-right stagger-2">
              <div className="relative h-96 rounded-3xl overflow-hidden">
                <Brain3D />
                {/* Glow effect */}
                <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-inner shadow-sky-400/30" />
              </div>
            </div>
          </div>

          {/* Sección de Estudiantes - Impacto Visual */}
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full animate-slide-in-left stagger-1">
              <div className="relative w-full h-full">
                <Image
                  src="/images/pexels-raul-sotomayor-2154397849-33201494.jpg"
                  alt="Estudiantes universitarios"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-sky-900/40 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-widest">Instituciones Educativas</p>
                <h3 className="text-2xl font-bold mt-2">Protegiendo a nuestros jóvenes</h3>
              </div>
            </div>

            <div className="space-y-6 animate-slide-in-right stagger-2">
              <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-8 rounded-3xl border border-emerald-200">
                <div className="flex items-start gap-4 mb-4">
                  <IconSparkles className="w-8 h-8 text-emerald-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Impacto Directo</h4>
                    <p className="text-slate-700 text-sm mt-1">
                      Monitoreo preventivo que alcanza instantáneamente a millones de estudiantes en México sin
                      comprometer su privacidad.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-br from-purple-50 to-pink-50 p-8 rounded-3xl border border-purple-200">
                <div className="flex items-start gap-4 mb-4">
                  <IconShield className="w-8 h-8 text-purple-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Privacidad Garantizada</h4>
                    <p className="text-slate-700 text-sm mt-1">
                      100% anónimo. Cumplimiento total con LFPDPPP. Los estudiantes nunca son identificados, solo sus
                      patrones de riesgo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-200">
                <div className="flex items-start gap-4 mb-4">
                  <IconBolt className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Acción en Tiempo Real</h4>
                    <p className="text-slate-700 text-sm mt-1">
                      Alertas inmediatas al personal de bienestar para intervenir preventivamente antes de una crisis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas de impacto */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className={`animate-fade-in-up stagger-${idx + 1} rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50 to-blue-50 p-6 shadow-lg hover:shadow-xl transition text-center`}
              >
                <p className="text-4xl font-bold text-sky-600 animate-counter">{stat.number}</p>
                <p className="mt-2 font-semibold text-slate-900">{stat.label}</p>
                <p className="mt-1 text-sm text-slate-600">{stat.detail}</p>
              </div>
            ))}
          </div>

          {/* Sección "Por qué Animus" */}
          <div className="rounded-4xl border-2 border-sky-300 bg-linear-to-r from-sky-50/50 via-blue-50/50 to-indigo-50/50 p-10 shadow-xl">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-600 font-bold">Crisis de salud pública</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">La urgencia detrás de Animus</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {impacts.map((impact, idx) => {
                const getIcon = (iconName: string) => {
                  const iconProps = { className: 'w-8 h-8' };
                  switch (iconName) {
                    case 'target':
                      return <IconTarget {...iconProps} />;
                    case 'lock':
                      return <IconLock {...iconProps} />;
                    case 'bolt':
                      return <IconBolt {...iconProps} />;
                    case 'hands':
                      return <IconHands {...iconProps} />;
                    case 'robot':
                      return <IconRobot {...iconProps} />;
                    case 'trending':
                      return <IconTrendingUp {...iconProps} />;
                    default:
                      return <IconSparkles {...iconProps} />;
                  }
                };
                return (
                  <div
                    key={impact.title}
                    className={`animate-fade-in-up stagger-${(idx % 5) + 1} rounded-2xl bg-white p-6 border border-sky-200 shadow-md hover:shadow-lg hover:border-sky-400 transition`}
                  >
                    <div className="text-sky-600 mb-3">{getIcon(impact.icon)}</div>
                    <h3 className="font-semibold text-slate-900 mb-2">{impact.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{impact.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Misión, Visión, Objetivo */}
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((item, idx) => {
              const colors = [
                'from-purple-50 to-purple-100',
                'from-emerald-50 to-emerald-100',
                'from-amber-50 to-amber-100',
              ];
              const textColors = ['text-purple-700', 'text-emerald-700', 'text-amber-700'];
              return (
                <article
                  key={item.title}
                  className={`animate-fade-in-up stagger-${idx + 1} rounded-3xl bg-linear-to-br ${colors[idx]} p-8 shadow-lg border border-slate-200 hover:shadow-xl transition hover:-translate-y-1`}
                >
                  <h3 className={`text-xl font-semibold ${textColors[idx]}`}>{item.title}</h3>
                  <p className="mt-4 leading-7 text-slate-700">{item.description}</p>
                </article>
              );
            })}
          </div>

          {/* Cómo funciona */}
          <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/10 animate-slide-in-left">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-600 font-bold">Cómo funciona</p>
              <h2 className="text-3xl font-semibold text-slate-900">Proceso simple y humanizado</h2>
              <p className="max-w-xl text-slate-600">
                Animus opera sin intervención humana directa en el análisis, entregando información clara para que
                quienes toman decisiones actúen rápidamente.
              </p>
              <div className="space-y-4 pt-4">
                {steps.map((step, idx) => {
                  const bgColors = [
                    'from-blue-50 to-cyan-50',
                    'from-emerald-50 to-teal-50',
                    'from-amber-50 to-orange-50',
                  ];
                  return (
                    <div
                      key={step.label}
                      className={`animate-fade-in-up stagger-${idx + 1} rounded-3xl border border-slate-200 bg-linear-to-r ${bgColors[idx]} p-5 hover:shadow-md transition hover:-translate-x-1`}
                    >
                      <p className="font-semibold text-slate-900">{step.label}</p>
                      <p className="mt-2 text-slate-700">{step.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/10 animate-slide-in-right">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-600 font-bold">Tecnologías destacadas</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">IA, scraping y analítica predictiva</h2>
              <ul className="mt-8 space-y-4">
                {technologies.map((tech, idx) => {
                  const techIcons = [
                    <IconLock key="lock" className="w-6 h-6" />,
                    <IconDatabase key="db" className="w-6 h-6" />,
                    <IconShield key="chart" className="w-6 h-6" />,
                    <IconMexico key="mx" className="w-6 h-6" />,
                    <IconPhone key="phone" className="w-6 h-6" />,
                  ];
                  const bgGradients = [
                    'from-red-50 to-pink-50',
                    'from-green-50 to-emerald-50',
                    'from-blue-50 to-cyan-50',
                    'from-yellow-50 to-amber-50',
                    'from-purple-50 to-pink-50',
                  ];
                  return (
                    <li
                      key={tech}
                      className={`animate-fade-in-up stagger-${idx + 1} flex gap-4 rounded-3xl border border-slate-200 bg-linear-to-r ${bgGradients[idx]} p-5 hover:shadow-md transition hover:scale-105`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shrink-0 animate-pulse-slow">
                        {techIcons[idx]}
                      </span>
                      <p className="text-slate-700 font-medium">{tech}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          {/* Ventajas competitivas */}
          <div className="rounded-4xl border-2 border-emerald-300 bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 p-10 shadow-xl">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-600 font-bold">Diferencial competitivo</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">¿Por qué Animus gana en el mercado?</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {advantages.map((adv, idx) => (
                <div
                  key={adv.title}
                  className={`animate-fade-in-up stagger-${idx + 1} rounded-2xl bg-white p-6 border border-emerald-200 shadow-lg hover:shadow-xl transition`}
                >
                  <h3 className="font-semibold text-slate-900 text-sm mb-2">{adv.title}</h3>
                  <p className="text-xs text-red-600 font-semibold mb-3">❌ {adv.description}</p>
                  <div className="bg-emerald-50 rounded-lg p-3 border-l-4 border-emerald-500">
                    <p className="text-xs text-emerald-700 font-semibold">✅ {adv.highlight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Datos de mercado */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {marketData.map((data, idx) => (
              <div
                key={data.label}
                className={`animate-fade-in-up stagger-${idx + 1} rounded-2xl bg-linear-to-br from-indigo-50 to-purple-50 p-6 shadow-lg border border-indigo-200 hover:shadow-xl hover:border-indigo-400 transition`}
              >
                <p className="text-xs uppercase tracking-widest text-indigo-600 font-bold">{data.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2 animate-counter">{data.value}</p>
                {data.growth && <p className="text-sm text-indigo-600 font-semibold mt-1">{data.growth}</p>}
                {data.detail && <p className="text-sm text-slate-600 mt-1">{data.detail}</p>}
              </div>
            ))}
          </div>

          {/* CTA Final */}
          <div className="rounded-4xl border border-sky-200 bg-linear-to-r from-sky-50 via-blue-50 to-indigo-50 p-10 shadow-2xl shadow-sky-900/10 animate-fade-in-up">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.24em] text-sky-600 font-bold">Únete a la revolución</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                  Una herramienta especializada para el contexto mexicano.
                </h2>
                <p className="mt-4 text-slate-600 leading-relaxed">
                  Animus no es una solución genérica: combina contexto local, anonimato institucional, analítica
                  predictiva y un flujo de alertas preventivas para apoyar el bienestar juvenil. Con crecimiento del
                  14.94% anual en el sector eHealth, es el momento para actuar.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  href="/signup"
                  className="rounded-full bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400 hover:shadow-lg animate-pulse-slow"
                >
                  Comenzar ahora
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-slate-300 px-6 py-3 text-slate-700 transition hover:border-slate-400 hover:shadow-lg"
                >
                  Ver plataforma
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-t border-slate-700">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
            {/* Branding */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo_black.svg" alt="Animus" className="h-12 w-12 invert" />
                <h3 className="text-xl font-bold">Animus</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Plataforma de IA para prevención de riesgos mentales en jóvenes mexicanos.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-300 mb-4">Solución</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-slate-400 hover:text-sky-400 transition">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-sky-400 transition">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-sky-400 transition">
                    Documentación
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-300 mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-slate-400 hover:text-sky-400 transition">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-sky-400 transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-400 hover:text-sky-400 transition">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-300 mb-4">Contacto</h4>
              <div className="space-y-2 text-sm text-slate-400 mb-6">
                <p>contacto@animus.com</p>
                <p>México</p>
              </div>
              <div className="flex gap-4">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-sky-400 transition"
                  aria-label="Twitter"
                >
                  <IconTwitter className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-sky-400 transition"
                  aria-label="Instagram"
                >
                  <IconInstagram className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-sky-400 transition"
                  aria-label="LinkedIn"
                >
                  <IconLinkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-sky-400 transition"
                  aria-label="Facebook"
                >
                  <IconFacebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
              <p>&copy; 2026 Animus. Todos los derechos reservados.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="#" className="hover:text-sky-400 transition">
                  Privacidad
                </Link>
                <Link href="#" className="hover:text-sky-400 transition">
                  Términos de Uso
                </Link>
                <Link href="#" className="hover:text-sky-400 transition">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
