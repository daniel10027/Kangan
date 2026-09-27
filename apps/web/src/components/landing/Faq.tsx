"use client";

import * as Accordion from "@radix-ui/react-accordion";

const QUESTIONS = [
  { q: "Où est conservé l'argent que je verse ?", a: "Sur un compte de cantonnement (séquestre) ouvert chez un partenaire financier agréé par la BCEAO. Kangan ne détient jamais les fonds en propre." },
  { q: "Que se passe-t-il si je n'atteins pas mon objectif ?", a: "À la date limite, le solde de la caisse est reversé à l'école — la caisse ne revient jamais vide. Vous réglez le solde restant directement ou obtenez un délai." },
  { q: "Puis-je changer d'école en cours de route ?", a: "Oui, avant l'échéance : le solde hors acompte est transférable vers une autre école partenaire. L'acompte reste acquis à l'école d'origine, sauf accord." },
  { q: "Un proche peut-il m'aider à cotiser ?", a: "Oui, via un lien ou un code à 6 caractères, y compris depuis la diaspora, jusqu'à 200 000 F CFA sans créer de compte." },
  { q: "Quels sont les frais Kangan ?", a: "Une commission de 2 % sur les fonds reversés à l'école, et 1 000 F CFA de frais d'ouverture par caisse et par année scolaire. Les frais de l'opérateur Mobile Money restent à la charge du payeur et sont affichés avant chaque validation." },
  { q: "Quel est le versement minimum ?", a: "500 F CFA, sans montant maximum autre que le solde restant dû." },
  { q: "Comment l'école reçoit-elle l'argent ?", a: "L'acompte est reversé sous 7 jours après activation de la caisse ; le solde est reversé sous 48 heures après la date limite, que l'objectif soit atteint ou non." },
  { q: "Que se passe-t-il si l'école refuse l'inscription ?", a: "Vous êtes remboursé à 100 %, hors frais d'opérateur, sous 7 jours ouvrés." },
];

/** FAQ — section 16, ordre 13. */
export function Faq() {
  return (
    <section id="faq" className="bg-creme py-20">
      <div className="container max-w-2xl">
        <h2 className="text-center font-display text-3xl font-bold text-encre md:text-4xl">Questions fréquentes</h2>

        <Accordion.Root type="single" collapsible className="mt-10 space-y-3">
          {QUESTIONS.map((item, i) => (
            <Accordion.Item
              key={item.q}
              value={`item-${i}`}
              className="overflow-hidden rounded-field border border-encre/10 bg-white"
            >
              <Accordion.Header>
                <Accordion.Trigger className="focus-ring group flex w-full items-center justify-between px-5 py-4 text-left font-medium text-encre">
                  {item.q}
                  <span className="ml-4 text-ocre transition-transform group-data-[state=open]:rotate-45">+</span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden px-5 pb-4 text-sm text-encre/65">
                {item.a}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
