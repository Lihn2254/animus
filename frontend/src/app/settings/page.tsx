"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HiOutlineTrash } from "react-icons/hi";
import { useAuth } from "@/app/context/AuthContext";
import { deleteAccount, getUser, updateUser } from "@/app/services/auth";
import { User } from "@/app/types/user";

type SettingsFormInputs = {
  fullname: string;
  username: string;
  email: string;
  country: string;
  region: string;
  newPassword: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser: updateAuthUser, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [originalProfile, setOriginalProfile] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SettingsFormInputs>({
    defaultValues: {
      fullname: "",
      username: "",
      email: "",
      country: "",
      region: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const fetched = await getUser(user.id ?? 0);
        setOriginalProfile(fetched);
        reset({
          fullname: fetched.fullname,
          username: fetched.username,
          email: fetched.email,
          country: fetched.country,
          region: fetched.region,
          newPassword: "",
        });
      } catch (error: any) {
        setServerError(error?.message || "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, reset, router]);

  const onSubmit = async (data: SettingsFormInputs) => {
    if (!user || !originalProfile) return;

    setServerError(null);
    setSuccessMessage(null);

    const updates: Partial<User> & { password?: string } = {};
    if (data.fullname !== originalProfile.fullname) updates.fullname = data.fullname;
    if (data.username !== originalProfile.username) updates.username = data.username;
    if (data.email !== originalProfile.email) updates.email = data.email;
    if (data.country !== originalProfile.country) updates.country = data.country;
    if (data.region !== originalProfile.region) updates.region = data.region;
    if (data.newPassword.trim().length > 0) updates.password = data.newPassword.trim();

    if (Object.keys(updates).length === 0) {
      setSuccessMessage("No hay cambios para guardar.");
      return;
    }

    const confirmed = window.confirm("¿Deseas guardar los cambios?");
    if (!confirmed) return;

    try {
      const updated = await updateUser(user.id ?? 0, updates);
      updateAuthUser({ ...updated, password: updates.password ?? user.password });
      setOriginalProfile(updated);
      reset({
        fullname: updated.fullname,
        username: updated.username,
        email: updated.email,
        country: updated.country,
        region: updated.region,
        newPassword: "",
      });
      setSuccessMessage("Perfil actualizado correctamente.");
    } catch (error: any) {
      setServerError(error?.message || "Error al actualizar el perfil.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const first = window.confirm("¿Estás seguro de que deseas eliminar tu cuenta?");
    if (!first) return;

    const second = window.confirm(
      "Esta acción es irreversible. ¿Deseas continuar?"
    );
    if (!second) return;

    try {
      await deleteAccount(user.email, user.password);
      logout();
      router.push("/login");
    } catch (error: any) {
      setServerError(error?.message || "No se pudo eliminar la cuenta.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="rounded-2xl bg-white p-8 shadow">
          <p className="text-center text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Messages */}
      {serverError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 mb-6">
          {serverError}
        </div>
      )}
      {successMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700 mb-6">
          {successMessage}
        </div>
      )}

      {/* Header Section */}
      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <p className="text-slate-400">Configuración</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Ajustes de la cuenta
        </h1>
      </section>

      {/* Profile Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Información Básica */}
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <p className="text-slate-400">Información básica</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Perfil</h2>
            <div className="mt-6 space-y-4">
              {/* Nombre Completo */}
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                <label
                  className="block text-sm font-medium text-slate-500 mb-2"
                  htmlFor="fullname"
                >
                  Nombre completo
                </label>
                <input
                  id="fullname"
                  type="text"
                  {...register("fullname")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Nombre de Usuario */}
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                <label
                  className="block text-sm font-medium text-slate-500 mb-2"
                  htmlFor="username"
                >
                  Nombre de usuario
                </label>
                <input
                  id="username"
                  type="text"
                  {...register("username")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="juanperez"
                />
              </div>

              {/* Email */}
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                <label
                  className="block text-sm font-medium text-slate-500 mb-2"
                  htmlFor="email"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              {/* País */}
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                <label
                  className="block text-sm font-medium text-slate-500 mb-2"
                  htmlFor="country"
                >
                  País
                </label>
                <input
                  id="country"
                  type="text"
                  {...register("country")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="México"
                />
              </div>

              {/* Región */}
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                <label
                  className="block text-sm font-medium text-slate-500 mb-2"
                  htmlFor="region"
                >
                  Región
                </label>
                <input
                  id="region"
                  type="text"
                  {...register("region")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ciudad de México"
                />
              </div>
            </div>
          </div>

          {/* Seguridad */}
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <p className="text-slate-400">Seguridad</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Contraseña
            </h2>
            <div className="mt-6 space-y-4">
              {/* Contraseña Actual */}
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                <label
                  className="block text-sm font-medium text-slate-500 mb-2"
                  htmlFor="current-password"
                >
                  Contraseña actual
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={user?.password || ""}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none cursor-not-allowed"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
                <label
                  className="block text-sm font-medium text-slate-500 mb-2"
                  htmlFor="new-password"
                >
                  Nueva contraseña (opcional)
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    {...register("newPassword")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
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
              disabled={isSubmitting}
              className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </section>
      </form>

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
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white shadow hover:bg-red-700 transition flex items-center gap-2 shrink-0"
          >
            <HiOutlineTrash size={18} />
            Eliminar cuenta
          </button>
        </div>
      </section>
    </>
  );
}