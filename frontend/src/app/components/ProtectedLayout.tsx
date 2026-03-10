"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está autenticado en localStorage
    const user = localStorage.getItem("user");
    
    if (!user) {
      // Si no hay usuario, redirigir a login
      router.push("/(auth)/login");
    } else {
      // Si hay usuario, permitir acceso
      setIsAuthenticated(true);
    }
  }, [router]);

  // Mientras verifica, no mostrar nada
  if (isAuthenticated === null) {
    return <div>Cargando...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
}
