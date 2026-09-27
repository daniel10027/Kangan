import Link from "next/link";
import { HeroIllustration } from "./HeroIllustration";
import { JaugeCanari } from "../JaugeCanari";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-vert-kangan py-20 text-creme">
      <div className="woven-pattern absolute inset-0 text-creme" />
      <div className="container relative grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex items-center rounded-pill bg-ocre/20 px-4 py-1.5 text-sm font-medium text-ocre">
            Moov Startup Challenge 2026 · Fin-Tech &amp; Ed-Tech
          </p>
          <h1 className="font-display text-4xl font-bold italic leading-tight md:text-5xl">
            La rentrée se prépare<br />pièce par pièce.
          </h1>
          <p className="mt-6 max-w-md text-lg text-creme/85">
            Kangan Finance permet aux parents ivoiriens d'épargner les frais scolaires par
            petits versements Moov Money, avec un encaissement garanti et tracé pour l'école.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/parent/login"
              className="focus-ring inline-flex min-h-[56px] items-center justify-center rounded-field bg-ocre px-7 text-lg font-semibold text-vert-kangan hover:bg-ocre/90"
            >
              Télécharger l'application
            </Link>
            <Link
              href="/ecole/adhesion"
              className="focus-ring inline-flex min-h-[56px] items-center justify-center rounded-field border border-creme/30 px-7 text-lg font-semibold text-creme hover:bg-creme/10"
            >
              Je suis une école
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex max-w-sm items-center justify-center">
          <div className="absolute -inset-6 rounded-card bg-creme/5" />
          <div className="relative grid grid-cols-2 items-center gap-6 rounded-card bg-creme p-8 shadow-soft">
            <div className="col-span-2 -mb-4 h-40">
              <HeroIllustration />
            </div>
            <div className="col-span-2 flex justify-center border-t border-encre/10 pt-6">
              <JaugeCanari balance={180000} targetAmount={300000} percent={60} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
