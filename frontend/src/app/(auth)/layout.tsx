import Footer from "../components/Footer";
import { AuthProvider } from "@/app/context/AuthContext";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      {children}
      <Footer />
    </AuthProvider>
  );
}
