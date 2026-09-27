import Link from "next/link";
import { Logo } from "../Logo";

/** Pied de page — section 16, ordre 15. */
export function Footer() {
  return (
    <footer className="bg-encre py-12 text-creme/70">
      <div className="container grid gap-8 md:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-3 max-w-xs text-sm text-creme/50">La caisse scolaire digitale. Abidjan, Côte d'Ivoire.</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-creme">Produit</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/parent/login" className="hover:text-creme">Espace parent</Link></li>
            <li><Link href="/ecole/adhesion" className="hover:text-creme">Devenir école partenaire</Link></li>
            <li><Link href="/parent/ecoles" className="hover:text-creme">Annuaire des écoles</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-creme">Légal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/legal/confidentialite" className="hover:text-creme">Politique de confidentialité</Link></li>
            <li><Link href="/legal/cgu" className="hover:text-creme">Conditions générales</Link></li>
            <li><Link href="/legal/securite" className="hover:text-creme">Politique de sécurité</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-creme">Contact</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>contact@kangan-finance.ci</li>
            <li>Cocody, Abidjan, Côte d'Ivoire</li>
          </ul>
        </div>
      </div>

      <div className="container mt-10 border-t border-creme/10 pt-6 text-xs text-creme/40">
        © {new Date().getFullYear()} Kangan Finance. Moov Startup Challenge 2026.
      </div>
    </footer>
  );
}
