"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

// 1. Esquema de validación extendido para Registro
const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // El error se marcará en este campo
  });

type SignupFormInputs = z.infer<typeof signupSchema>;

export default function Singup() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
      console.log("Datos de registro:", data);
      // Simulación de registro en API
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("¡Cuenta creada con éxito!");
    } catch (error) {
      setServerError(
        "Hubo un problema al crear tu cuenta. Intenta con otro correo.",
      );
    }
  };

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
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre Completo
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 sm:text-sm
                    ${errors.fullName ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                  placeholder="Juan Pérez"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 sm:text-sm
                    ${errors.email ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                  placeholder="ejemplo@correo.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 sm:text-sm pr-10
                    ${errors.password ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
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
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Campo Confirmar Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className={`appearance-none block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 sm:text-sm
                    ${errors.confirmPassword ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"}`}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.confirmPassword.message}
                  </p>
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
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Inicia sesión aquí
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
