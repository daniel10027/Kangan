import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/server/supabase-server";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin/dashboard", label: "Vue globale" },
  { href: "/admin/etablissements", label: "Établissements" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/litiges", label: "Litiges" },
  { href: "/admin/audit", label: "Audit" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  if (!["kangan_agent", "kangan_super_admin"].includes(profile.role)) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-encre text-creme">
      <div className="flex">
        <aside className="hidden w-56 flex-shrink-0 border-r border-creme/10 p-6 md:block">
          <Link href="/admin/dashboard">
            <Logo dark />
          </Link>
          <nav className="mt-8 space-y-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-field px-3 py-2 text-sm text-creme/70 hover:bg-creme/5 hover:text-creme">
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="mt-8 text-xs text-creme/30">{profile.full_name} · {profile.role === "kangan_super_admin" ? "Super-admin" : "Agent"}</p>
        </aside>
        <main className="min-h-screen flex-1 bg-creme p-8 text-encre">{children}</main>
      </div>
    </div>
  );
}
