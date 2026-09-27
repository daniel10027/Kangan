"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

export default function OnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [commune, setCommune] = useState("");
  const [language, setLanguage] = useState<"fr" | "dioula" | "baoule">("fr");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.put("/profile", { full_name: fullName, commune, language, pin });
      router.push("/parent/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-vert-kangan px-5 py-12">
      <div className="w-full max-w-sm rounded-card bg-creme p-8 shadow-soft">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <p className="mt-2 text-sm text-encre/60">Complétez votre profil</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-encre">Nom complet</span>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-encre">Commune</span>
            <input
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              placeholder="Cocody, Yopougon, Abobo…"
              className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-encre">Langue</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4"
            >
              <option value="fr">Français</option>
              <option value="dioula">Dioula (audio, phase 2)</option>
              <option value="baoule">Baoulé (audio, phase 2)</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-encre">Créer un code PIN à 4 chiffres</span>
            <input
              required
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4 text-center text-2xl tracking-[0.5em]"
            />
          </label>

          {error && <p className="text-sm font-medium text-piment">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Continuer
          </Button>
        </form>
      </div>
    </div>
  );
}
