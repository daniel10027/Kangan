import { AnimatedCounter } from "../AnimatedCounter";

const STATS = [
  { value: 30_000_000, suffix: " F CFA", label: "épargnés en phase pilote" },
  { value: 300, suffix: "", label: "caisses ouvertes" },
  { value: 5, suffix: "", label: "écoles partenaires à Abidjan" },
];

/** Compteur vivant — section 16, ordre 3. Objectifs pilote (section 3). */
export function LiveCounters() {
  return (
    <section className="border-y border-encre/8 bg-white py-12">
      <div className="container grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="font-display text-4xl font-bold text-vert-kangan">
              <AnimatedCounter to={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-1 text-sm text-encre/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
