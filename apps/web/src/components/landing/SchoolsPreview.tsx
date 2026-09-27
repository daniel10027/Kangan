import Link from "next/link";
import { getSupabaseServerClient } from "@/server/supabase-server";

/** Annuaire aperçu — section 16, ordre 12. */
export async function SchoolsPreview() {
  const supabase = await getSupabaseServerClient();
  const { data: schools } = await supabase.from("schools").select("name, slug, commune, cycles").eq("status", "actif").limit(6);

  return (
    <section className="bg-white py-20">
      <div className="container">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-encre md:text-4xl">Établissements partenaires</h2>
            <p className="mt-2 text-encre/60">Cocody, Yopougon, Abobo, Marcory — et bientôt toute la Côte d'Ivoire.</p>
          </div>
          <Link href="/parent/ecoles" className="hidden text-sm font-semibold text-vert-kangan hover:underline md:inline">
            Voir l'annuaire complet →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(schools ?? []).map((school) => (
            <Link
              key={school.slug}
              href={`/parent/ecoles/${school.slug}`}
              className="rounded-card border border-encre/10 bg-creme p-5 transition-colors hover:border-ocre"
            >
              <p className="font-display font-bold text-encre">{school.name}</p>
              <p className="mt-1 text-sm text-encre/60">{school.commune}, Abidjan</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-vert-kangan/70">{(school.cycles ?? []).join(" · ")}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/parent/ecoles" className="text-sm font-semibold text-vert-kangan hover:underline">
            Voir l'annuaire complet →
          </Link>
        </div>
      </div>
    </section>
  );
}
