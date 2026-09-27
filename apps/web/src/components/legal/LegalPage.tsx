import Link from "next/link";
import { Logo } from "../Logo";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-creme">
      <header className="border-b border-encre/8 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/"><Logo /></Link>
          <Link href="/" className="text-sm text-encre/60 hover:text-vert-kangan">Retour à l'accueil</Link>
        </div>
      </header>
      <main className="container max-w-2xl py-12">
        <h1 className="font-display text-3xl font-bold text-encre">{title}</h1>
        <p className="mt-1 text-sm text-encre/50">Dernière mise à jour : {updated}</p>
        <div className="prose prose-sm mt-8 max-w-none space-y-4 text-encre/80 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-encre [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </main>
    </div>
  );
}
