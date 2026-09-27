import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentProfile } from "@/server/supabase-server";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/parent/login");
  const profile = await getCurrentProfile();
  if (!profile?.full_name) redirect("/parent/onboarding");

  return (
    <div className="min-h-screen bg-creme">
      <header className="border-b border-encre/8 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/parent/dashboard">
            <Logo />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-encre/70">
            <Link href="/parent/dashboard" className="hover:text-vert-kangan">Mes caisses</Link>
            <Link href="/parent/ecoles" className="hover:text-vert-kangan">Écoles</Link>
            <span className="rounded-pill bg-vert-kangan/10 px-3 py-1 text-xs font-semibold text-vert-kangan">
              {profile.full_name}
            </span>
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
