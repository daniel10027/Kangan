import Link from "next/link";

/** Appel final — section 16, ordre 14. */
export function FinalCta() {
  return (
    <section className="woven-pattern relative overflow-hidden bg-vert-kangan py-20 text-creme">
      <div className="container relative text-center">
        <h2 className="font-display text-3xl font-bold italic md:text-4xl">La rentrée se prépare pièce par pièce.</h2>
        <p className="mx-auto mt-4 max-w-md text-creme/80">
          Ouvrez votre première caisse en moins de 3 minutes, ou faites de votre établissement un partenaire Kangan.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/parent/login"
            className="focus-ring inline-flex min-h-[56px] items-center justify-center rounded-field bg-ocre px-8 text-lg font-semibold text-vert-kangan hover:bg-ocre/90"
          >
            Télécharger l'application
          </Link>
          <Link
            href="/ecole/adhesion"
            className="focus-ring inline-flex min-h-[56px] items-center justify-center rounded-field border border-creme/30 px-8 text-lg font-semibold hover:bg-creme/10"
          >
            Devenir école partenaire
          </Link>
        </div>
      </div>
    </section>
  );
}
