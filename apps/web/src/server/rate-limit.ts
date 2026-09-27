/**
 * Limitation de débit — section 14 : "60 requêtes par minute et par
 * utilisateur, 5 demandes d'OTP par heure et par numéro."
 *
 * Implémentation en mémoire (best-effort par instance serverless) :
 * suffisante pour le pilote (charge cible section 17 : 5 000 versements/heure
 * en pointe, répartis dans le temps). Pour une montée en charge multi-région,
 * remplacer ce module par un backend partagé (Upstash Redis) sans changer
 * l'API `checkRateLimit` — voir docs/DEPLOYMENT.md.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export const RATE_LIMITS = {
  apiPerUserPerMinute: { limit: 60, windowMs: 60_000 },
  otpPerPhonePerHour: { limit: 5, windowMs: 60 * 60_000 },
};
