import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Image
          src="/logo_black.svg"
          alt="Main logo"
          width={70}
          height={50}
        />
        <div>
          <h1 className="text-4xl font-semibold tracking-tight font-funnel">
            Animus
          </h1>
          <p className="text-sm text-slate-500">
            Analizador demográfico de salud mental
          </p>
        </div>
      </div>
      <nav className="flex lg:flex-nowrap items-center gap-4 font-medium text-slate-600">
        <button className="rounded-full bg-slate-900 px-4 py-2 text-white">
          General
        </button>
        <button className="rounded-full px-4 py-2 hover:bg-slate-200">
          Tendencias
        </button>
        <button className="rounded-full px-4 py-2 hover:bg-slate-200">
          Planificación
        </button>
        <button className="rounded-full px-4 py-2 hover:bg-slate-200">
          Reportes
        </button>
      </nav>
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1 sm:min-w-65">
          <Image
            className="absolute top-2.5 left-3"
            src='/icons/search.svg'
            alt="Search"
            height={25}
            width={25}
          />
          <input
            className="h-11 w-3 xl:w-full rounded-full border border-slate-200 bg-white/80 pl-10 pr-16 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400"
            placeholder="Buscar"
            type="search"
          />
        </div>
        <div className="relative group">
          <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-slate-900 to-slate-500 text-xs font-semibold text-white">
              UA
            </span>
            Admin
          </button>
          <ul className="w-fit whitespace-nowrap pointer-events-none absolute right-0 top-14 rounded-2xl border border-slate-100 bg-white p-3 text-slate-600 opacity-0 shadow-xl transition group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
            <li className="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50">
              <button>Perfil</button>
            </li>
            <li className="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50">
              <button>Notificaciones</button>
            </li>
            <li className="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50">
              <button>Configuración</button>
            </li>
            <hr className="my-1" />
            <li className="w-full rounded-xl px-3 py-2 text-left hover:bg-slate-50">
              <Link href="/login">Cerrar sesión</Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
