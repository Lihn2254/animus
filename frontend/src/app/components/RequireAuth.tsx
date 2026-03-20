"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // While we load the auth state, avoid flashing content.
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-2xl bg-white px-6 py-8 shadow-lg">
          <p className="text-center text-slate-600">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
