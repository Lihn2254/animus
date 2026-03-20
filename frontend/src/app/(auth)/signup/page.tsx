"use client";
import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { User } from "../../types/user";

// 1. Esquema de validación
const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
    username: z
      .string()
      .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres" }),
    email: z
      .string()
      .min(1, { message: "El correo es obligatorio" })
      .email({ message: "Formato de correo inválido" }),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Debes confirmar tu contraseña" }),
    country: z
      .string()
      .min(1, { message: "El país es obligatorio" }),
    region: z
      .string()
      .min(1, { message: "La región es obligatoria" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function Singup() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { register: authRegister } = useAuth();

  // Cambiar el nombre de la pestaña al cargar el componente
  useEffect(() => {
    document.title = "Registro Animus";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    setServerError(null);
    try {
      const userData: User = {
        fullname: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
        country: data.country,
        region: data.region,
      };
      await authRegister(userData);
      router.push("/");
    } catch (error: any) {
      setServerError(error.message || "Hubo un problema al crear tu cuenta. Intenta con otro correo.");
    }
  };

  // Clase común para los inputs (text-gray-900 hace que la fuente sea más oscura al escribir)
  const inputClassName = `appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 sm:text-sm text-gray-900 `;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col text-center items-center">
          <Image
            className="pb-6"
            src="/logo_black.svg"
            alt="Animus logo"
            width={150}
            height={150}
          />
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-gray-500">
            Únete a nuestra plataforma hoy mismo
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Campo Nombre Completo */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  type="text"
                  className={`${inputClassName} ${errors.fullName ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                  placeholder="Juan Pérez"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.fullName.message}</p>
                )}
              </div>
            </div>

            {/* Campo Nombre de Usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nombre de Usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  className={`${inputClassName} ${errors.username ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                  placeholder="juanperez"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.username.message}</p>
                )}
              </div>
            </div>

            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  className={`${inputClassName} ${errors.email ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                  placeholder="ejemplo@correo.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Campo País */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                País
              </label>
              <div className="mt-1">
                <input
                  id="country"
                  type="text"
                  className={`${inputClassName} ${errors.country ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                  placeholder="México"
                  {...register("country")}
                />
                {errors.country && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.country.message}</p>
                )}
              </div>
            </div>

            {/* Campo Región */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                Región
              </label>
              <div className="mt-1">
                <input
                  id="region"
                  type="text"
                  className={`${inputClassName} ${errors.region ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                  placeholder="Ciudad de México"
                  {...register("region")}
                />
                {errors.region && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.region.message}</p>
                )}
              </div>
            </div>

            {/* Campo Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${inputClassName} pr-10 ${errors.password ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Campo Confirmar Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className={`${inputClassName} ${errors.confirmPassword ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          {serverError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-sm rounded-r">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
          >
            {isSubmitting ? "Creando cuenta..." : "Registrarse"}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-500">¿Ya tienes cuenta? </span>
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}