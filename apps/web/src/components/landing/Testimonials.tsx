const TESTIMONIALS = [
  { name: "Aya K.", role: "Mère de 2 enfants, Adjamé", quote: "Je verse 1000 F CFA presque tous les jours. En septembre, tout est déjà prêt." },
  { name: "Moussa D.", role: "Père de famille, Yopougon", quote: "Le relevé PDF me rassure : je vois exactement ce qui a été versé et reversé à l'école." },
  { name: "Directrice, Les Colombes", role: "Groupe scolaire, Cocody", quote: "Nous connaissons nos effectifs avant la rentrée. La trésorerie de septembre n'est plus un stress." },
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ocre/20 font-display font-bold text-vert-kangan">
      {initials}
    </div>
  );
}

/** Témoignages — section 16, ordre 11. Portraits en attente du shooting réel (voir SUIVI.md). */
export function Testimonials() {
  return (
    <section className="bg-creme py-20">
      <div className="container">
        <h2 className="text-center font-display text-3xl font-bold text-encre md:text-4xl">Ils préparent déjà leur rentrée</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-card bg-white p-6 shadow-soft">
              <blockquote className="text-sm text-encre/75">« {t.quote} »</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar name={t.name} />
                <div>
                  <p className="text-sm font-semibold text-encre">{t.name}</p>
                  <p className="text-xs text-encre/50">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
