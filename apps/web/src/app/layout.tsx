import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["italic", "normal"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Kangan Finance — La caisse scolaire digitale",
    template: "%s · Kangan Finance",
  },
  description:
    "La rentrée se prépare pièce par pièce. Kangan Finance permet aux parents ivoiriens d'épargner progressivement les frais scolaires via Mobile Money, avec un encaissement garanti et tracé pour les établissements.",
  openGraph: {
    title: "Kangan Finance — La caisse scolaire digitale",
    description: "Épargnez la rentrée scolaire pièce par pièce, avec Moov Money.",
    locale: "fr_CI",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  icons: { icon: [{ url: "/favicon.svg" }, { url: "/icon-512.png", sizes: "512x512" }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
