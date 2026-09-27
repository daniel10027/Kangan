/**
 * Le separateur de milliers de la locale fr-FR est une espace fine
 * insecable (U+202F) ou insecable (U+00A0) selon l'environnement -- des
 * caracteres que les polices PDF standard (Helvetica) ne rendent pas. On
 * les normalise systematiquement en espace classique (U+0020).
 */
function withPlainSpaces(formatted: string): string {
  return formatted.replace(/[\u00A0\u202F]/g, " ");
}

/** Formate un montant entier F CFA pour l'affichage : "150 000 F CFA". */
export function formatFcfa(amount: number): string {
  return `${withPlainSpaces(amount.toLocaleString("fr-FR"))} F CFA`;
}

/** Formate un montant compact : "150 000" sans devise, pour les champs de saisie. */
export function formatAmount(amount: number): string {
  return withPlainSpaces(amount.toLocaleString("fr-FR"));
}

/** Formate une date ISO en francais long : "23 octobre 2026". */
export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Masque un numero de telephone pour l'affichage : +225 07 .. .. .. 12. */
export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  const start = phone.slice(0, 6);
  const end = phone.slice(-2);
  return `${start} \u2022\u2022 \u2022\u2022 \u2022\u2022 ${end}`;
}
