"use client";

import { HiOutlineTrash } from "react-icons/hi";

export default function SettingsPage() {
  return (
    <>
      {/* Header Section */}
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <p className="text-slate-400">Configuración</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Ajustes de la cuenta
        </h1>
      </section>

      {/* Profile Settings */}
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <p className="text-slate-400">Información básica</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Perfil</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
              <label
                className="block text-sm font-medium text-slate-500 mb-2"
                htmlFor="institution"
              >
                Nombre de la institución
              </label>
              <input
                id="institution"
                name="institution"
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Universidad Anáhuac"
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
              <label
                className="block text-sm font-medium text-slate-500 mb-2"
                htmlFor="username"
              >
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="admin_anahuac"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <p className="text-slate-400">Seguridad</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Contraseña
          </h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
              <label
                className="block text-sm font-medium text-slate-500 mb-2"
                htmlFor="current-password"
              >
                Contraseña actual
              </label>
              <input
                id="current-password"
                name="current-password"
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="••••••••"
              />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
              <label
                className="block text-sm font-medium text-slate-500 mb-2"
                htmlFor="new-password"
              >
                Nueva contraseña
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Guardar cambios
            </h3>
            <p className="text-sm text-slate-500">
              Asegúrate de revisar los cambios antes de guardar
            </p>
          </div>
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            Guardar cambios
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">
                <HiOutlineTrash size={20} />
              </span>
              <h3 className="text-lg font-semibold text-red-600">
                Zona de peligro
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Esta acción es irreversible. Se eliminarán todos tus datos de la
              plataforma.
            </p>
          </div>
          <button className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white shadow hover:bg-red-700 transition flex items-center gap-2 shrink-0">
            <HiOutlineTrash size={18} />
            Eliminar cuenta
          </button>
        </div>
      </section>
    </>
  );
}