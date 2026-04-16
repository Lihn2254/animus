import Header from "@/app/components/Header";
import RequireAuth from "@/app/components/RequireAuth";
import { AuthProvider } from "@/app/context/AuthContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <RequireAuth>
        <div className="min-h-screen bg-white text-slate-900">
          <div className="mx-auto flex md:w-8/12 lg:w-11/12 flex-col gap-10 px-6 pb-16 pt-8 lg:px-10">
            <Header />
            <main className="flex flex-col gap-10">{children}</main>
          </div>
        </div>
      </RequireAuth>
    </AuthProvider>
  );
}
