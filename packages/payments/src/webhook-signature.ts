import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Vérifie la signature HMAC-SHA256 d'un webhook opérateur.
 * Mesure de sécurité section 15 : "Vérification de signature ... rejeu
 * impossible grâce à l'idempotence".
 */
export function verifyHmacSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(signatureHeader, "utf8");
  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

export function signPayload(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}
