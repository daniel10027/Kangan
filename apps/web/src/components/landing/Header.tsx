"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "../Logo";

const LINKS = [
  { href: "#parents", label: "Parents" },
  { href: "#ecoles", label: "Écoles" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-encre/8 bg-creme/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="Kangan Finance, accueil">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-encre/70 hover:text-vert-kangan">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/ecole/adhesion" className="text-sm font-semibold text-vert-kangan hover:underline">
            Devenir école partenaire
          </Link>
          <Link
            href="/parent/login"
            className="focus-ring inline-flex min-h-[40px] items-center justify-center rounded-field bg-vert-kangan px-4 text-sm font-semibold text-creme hover:bg-vert-kangan/90"
          >
            Ouvrir une caisse
          </Link>
        </div>

        <button
          className="focus-ring rounded-field p-2 md:hidden"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-encre" />
          <span className="mt-1.5 block h-0.5 w-6 bg-encre" />
          <span className="mt-1.5 block h-0.5 w-6 bg-encre" />
        </button>
      </div>

      {open && (
        <div className="border-t border-encre/8 bg-creme px-5 pb-5 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-encre/70" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <Link href="/ecole/adhesion" className="text-sm font-semibold text-vert-kangan">
              Devenir école partenaire
            </Link>
            <Link
              href="/parent/login"
              className="focus-ring inline-flex min-h-[40px] w-full items-center justify-center rounded-field bg-vert-kangan px-4 text-sm font-semibold text-creme"
            >
              Ouvrir une caisse
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
