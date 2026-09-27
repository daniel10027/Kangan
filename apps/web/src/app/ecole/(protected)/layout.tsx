import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/server/supabase-server";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function SchoolLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ecole/login");

  const { data: membership } = await supabase
    .from("school_members")
    .select("role, schools(id, name)")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!membership) redirect("/ecole/login");

  const school = membership.schools as unknown as { id: string; name: string };

  return (
    <div className="min-h-screen bg-creme">
      <header className="border-b border-encre/8 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/ecole/dashboard">
            <Logo />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-encre/70">
            <Link href="/ecole/dashboard" className="hover:text-vert-kangan">Tableau de bord</Link>
            <Link href="/ecole/caisses" className="hover:text-vert-kangan">Caisses</Link>
            <Link href="/ecole/tarifs" className="hover:text-vert-kangan">Tarifs</Link>
            <Link href="/ecole/reversements" className="hover:text-vert-kangan">Reversements</Link>
            <span className="rounded-pill bg-vert-kangan/10 px-3 py-1 text-xs font-semibold text-vert-kangan">{school.name}</span>
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
