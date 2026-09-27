const STEPS = [
  { n: "01", title: "Choisir l'école", desc: "Recherchez l'établissement de votre enfant et consultez les frais publiés en ligne." },
  { n: "02", title: "Créer la caisse", desc: "En 4 écrans : école, bénéficiaire, objectif (inscription, scolarité ou totalité), et acompte." },
  { n: "03", title: "Verser l'acompte", desc: "Via Moov Money. La caisse s'active et l'école est notifiée immédiatement." },
  { n: "04", title: "Compléter à son rythme", desc: "Alimentez la caisse par jour, semaine ou mois — à chaque petite rentrée d'argent." },
];

/** Comment ça marche — section 16, ordre 5. */
export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="bg-white py-20">
      <div className="container">
        <h2 className="text-center font-display text-3xl font-bold text-encre md:text-4xl">Comment ça marche</h2>
        <p className="mx-auto mt-3 max-w-md text-center text-encre/60">
          Le parcours parent tient en quatre gestes sur mobile.
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.n} className="relative">
              <p className="font-display text-5xl font-bold text-ocre/30">{step.n}</p>
              <h3 className="mt-2 font-display text-lg font-bold text-vert-kangan">{step.title}</h3>
              <p className="mt-2 text-sm text-encre/60">{step.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="absolute right-[-16px] top-6 hidden h-px w-8 bg-encre/15 md:block" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
