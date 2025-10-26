import AuthGuard from "@/components/AuthGuard";
import ClientNavbar from "@/components/ClientNavbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireOnboarding>
      <ClientNavbar />
      {children}
    </AuthGuard>
  );
}
