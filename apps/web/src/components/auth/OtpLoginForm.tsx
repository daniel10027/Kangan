"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

type Step = "phone" | "otp";
type LoginContext = "parent" | "ecole" | "admin";

interface VerifyResult {
  role: string;
  profile_complete: boolean;
}

/**
 * Calcule la redirection post-connexion. Un simple identifiant de contexte
 * (sérialisable) est passé en prop plutôt qu'une fonction, qui ne peut pas
 * traverser la frontière Server → Client Component.
 */
function resolveRedirect(context: LoginContext, result: VerifyResult): string {
  if (context === "parent") return result.profile_complete ? "/parent/dashboard" : "/parent/onboarding";
  if (context === "ecole") return "/ecole/dashboard";
  return "/admin/dashboard";
}

export function OtpLoginForm({ subtitle, context }: { subtitle: string; context: LoginContext }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+225");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/otp", { phone });
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await api.post<VerifyResult>("/auth/verify", { phone, code });
      router.push(resolveRedirect(context, result));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Code invalide.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-vert-kangan px-5 py-12">
      <div className="w-full max-w-sm rounded-card bg-creme p-8 shadow-soft">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <p className="mt-2 text-sm text-encre/60">{subtitle}</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-encre">Numéro de téléphone</span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4 text-base"
              />
            </label>
            {error && <p className="text-sm font-medium text-piment">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Recevoir un code par SMS
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-sm text-encre/60">Code envoyé au {phone}.</p>
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4 text-center text-2xl tracking-[0.5em]"
            />
            {error && <p className="text-sm font-medium text-piment">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Valider
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
