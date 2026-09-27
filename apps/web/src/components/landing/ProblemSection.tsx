const NUMBERS = [
  { value: "150k–1,5M", unit: "F CFA", label: "à réunir d'un coup en septembre" },
  { value: "3", unit: "semaines", label: "pour trouver la somme, en moyenne" },
  { value: "32", unit: "petites rentrées", label: "d'argent par an chez un ménage actif" },
];

/** Le problème en trois chiffres + témoignage court (section 16, ordre 4). */
export function ProblemSection() {
  return (
    <section className="bg-creme py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-encre md:text-4xl">Septembre arrive trop vite</h2>
          <p className="mt-4 text-encre/70">
            Les revenus des familles ivoiriennes arrivent par petites sommes tout au long de
            l'année. La rentrée, elle, exige tout d'un coup.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {NUMBERS.map((n) => (
            <div key={n.label} className="rounded-card border border-encre/10 bg-white p-8 text-center shadow-soft">
              <p className="font-display text-3xl font-bold text-terre-cuite">
                {n.value} <span className="text-lg text-encre/50">{n.unit}</span>
              </p>
              <p className="mt-2 text-sm text-encre/60">{n.label}</p>
            </div>
          ))}
        </div>

        <blockquote className="mx-auto mt-12 max-w-xl border-l-4 border-ocre pl-6 text-lg italic text-encre/80">
          « Chaque année, je vends un peu de mon stock ou je m'endette pour l'inscription. Avec
          Kangan, j'ai commencé à cotiser dès février pour la rentrée de septembre. »
          <footer className="mt-3 text-sm not-italic text-encre/50">— Aya, commerçante à Adjamé, mère de deux enfants</footer>
        </blockquote>
      </div>
    </section>
  );
}
