import AuthGuard from "@/components/AuthGuard";
import ClientNavbar from "@/components/ClientNavbar";
import FloatingChat from "@/components/FloatingChat";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireOnboarding>
      <div className="flex flex-col min-h-screen">
        <ClientNavbar />
        <main className="flex-1">{children}</main>
        <FloatingChat />
      </div>
    </AuthGuard>
  );
}
