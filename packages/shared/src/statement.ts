import { createHash } from "./crypto-cross";

/**
 * RG14 — Chaque relevé porte un numéro unique et un QR code renvoyant vers
 * une page de vérification publique (/verify/{number}).
 */
export function generateStatementNumber(schoolYear: string, sequence: number): string {
  const yearPart = schoolYear.split("-")[0] ?? new Date().getFullYear().toString();
  return `KG-REL-${yearPart}-${String(sequence).padStart(6, "0")}`;
}

export interface StatementVerifyPayload {
  number: string;
  boxReference: string;
  total: number;
  periodStart: string;
  periodEnd: string;
}

/**
 * Calcule le hash de vérification d'un relevé (imprimé dans le QR code).
 * Le hash est déterministe : le relevé affiché au parent et celui affiché
 * à l'école doivent produire le même total et le même numéro de vérification
 * (critère d'acceptation, section 6).
 */
export function computeVerifyHash(payload: StatementVerifyPayload, secret: string): string {
  const raw = [payload.number, payload.boxReference, payload.total, payload.periodStart, payload.periodEnd].join("|");
  return createHash(raw, secret);
}

export function buildVerifyUrl(baseUrl: string, number: string): string {
  return `${baseUrl.replace(/\/$/, "")}/verify/${encodeURIComponent(number)}`;
}

/** Génère une référence de caisse lisible : KG-2026-000123. */
export function generateBoxReference(year: number, sequence: number): string {
  return `KG-${year}-${String(sequence).padStart(6, "0")}`;
}

/** Génère un code de contribution familiale à 6 caractères (RG12). */
export function generateContributionCode(random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans caractères ambigus (0/O, 1/I)
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(random() * alphabet.length)];
  }
  return code;
}
