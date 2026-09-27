import Link from "next/link";
import { getSupabaseServerClient } from "@/server/supabase-server";

export default async function SchoolsDirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string; commune?: string }> }) {
  const { q, commune } = await searchParams;
  const supabase = await getSupabaseServerClient();

  let query = supabase.from("schools").select("*").eq("status", "actif").order("name");
  if (q) query = query.ilike("name", `%${q}%`);
  if (commune) query = query.eq("commune", commune);
  const { data: schools } = await query;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-encre">Annuaire des écoles</h1>

      <form className="mt-4 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Nom de l'école"
          className="focus-ring h-11 flex-1 min-w-[200px] rounded-field border border-encre/15 px-4"
        />
        <select name="commune" defaultValue={commune} className="focus-ring h-11 rounded-field border border-encre/15 px-4">
          <option value="">Toutes les communes</option>
          {["Cocody", "Yopougon", "Abobo", "Marcory"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="h-11 rounded-field bg-vert-kangan px-5 font-semibold text-creme">Rechercher</button>
      </form>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(schools ?? []).map((school) => (
          <Link key={school.id} href={`/parent/ecoles/${school.slug}`} className="rounded-card border border-encre/10 bg-white p-5 hover:border-ocre">
            <p className="font-display font-bold text-encre">{school.name}</p>
            <p className="mt-1 text-sm text-encre/60">{school.commune}, {school.city}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-vert-kangan/70">{(school.cycles ?? []).join(" · ")}</p>
          </Link>
        ))}
        {(schools ?? []).length === 0 && <p className="text-sm text-encre/50">Aucune école trouvée.</p>}
      </div>
    </div>
  );
}
