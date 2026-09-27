const SECURITY_BADGES = [
  { title: "Séquestre agréé", desc: "Les fonds transitent par un partenaire financier agréé, jamais par Kangan." },
  { title: "Relevés vérifiables", desc: "Chaque relevé porte un QR code de vérification publique." },
  { title: "Données protégées", desc: "Chiffrement en transit et au repos, conforme à la loi ivoirienne (ARTCI)." },
];

const OPERATORS = ["Moov Money", "MTN Money", "Orange Money", "Wave", "Carte bancaire"];

/** Sécurité + Paiement — section 16, ordres 9 et 10. */
export function SecurityAndPayments() {
  return (
    <section className="border-y border-encre/8 bg-white py-20">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-3">
          {SECURITY_BADGES.map((b) => (
            <div key={b.title} className="rounded-card border border-encre/10 p-6 text-center">
              <h4 className="font-display font-bold text-vert-kangan">{b.title}</h4>
              <p className="mt-2 text-sm text-encre/60">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-encre/40">Moyens de paiement acceptés</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {OPERATORS.map((op) => (
              <span key={op} className="rounded-pill border border-encre/15 bg-creme px-5 py-2 text-sm font-medium text-encre/70">
                {op}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-encre/40">Moov Money — rail de paiement principal</p>
        </div>
      </div>
    </section>
  );
}
