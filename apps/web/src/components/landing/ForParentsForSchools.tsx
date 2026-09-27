const PARENT_POINTS = [
  "Zéro dette : vous épargnez, vous n'empruntez pas.",
  "Relevé PDF horodaté et vérifiable à chaque instant.",
  "Contribution familiale : un proche peut cotiser via un lien, même depuis la diaspora.",
  "Rappels intelligents pour ne jamais perdre le rythme.",
];

const SCHOOL_POINTS = [
  "Trésorerie anticipée : l'acompte arrive dès l'ouverture de la caisse.",
  "Visibilité sur les effectifs avant la rentrée, caisse par caisse.",
  "Fin des impayés et des litiges : chaque franc est horodaté et lié à un élève.",
  "Tableau de bord en temps réel, export comptable en un clic.",
];

function PointList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-encre/75">
          <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-ocre" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Pour les parents / Pour les écoles — section 16, ordres 7 et 8. */
export function ForParentsForSchools() {
  return (
    <section className="bg-creme py-20">
      <div className="container grid gap-10 md:grid-cols-2">
        <div id="parents" className="rounded-card bg-white p-8 shadow-soft">
          <span className="inline-flex rounded-pill bg-vert-kangan/10 px-3 py-1 text-xs font-semibold text-vert-kangan">Pour les parents</span>
          <h3 className="mt-4 font-display text-2xl font-bold text-encre">L'esprit tranquille dès février</h3>
          <PointList items={PARENT_POINTS} />
        </div>

        <div id="ecoles" className="rounded-card bg-vert-kangan p-8 text-creme shadow-soft">
          <span className="inline-flex rounded-pill bg-ocre/20 px-3 py-1 text-xs font-semibold text-ocre">Pour les écoles</span>
          <h3 className="mt-4 font-display text-2xl font-bold">Une trésorerie de rentrée sereine</h3>
          <ul className="mt-6 space-y-3">
            {SCHOOL_POINTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-creme/85">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-ocre" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
