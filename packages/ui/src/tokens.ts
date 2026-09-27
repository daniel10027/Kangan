/**
 * Jetons de design Kangan Finance — cahier des charges section 11
 * (Identité visuelle et direction artistique). Source unique de vérité
 * pour le web (Tailwind config) et le mobile (NativeWind config).
 */

export const colors = {
  vertKangan: "#0F3D2E", // Primaire — fonds forts, boutons principaux, en-têtes
  ocre: "#D98E2B", // Accent — progression, chiffres clés, appels à l'action secondaires
  terreCuite: "#B5502F", // Chaleur — illustrations, états d'alerte doux
  creme: "#F6EFE3", // Fond général clair
  encre: "#1B1B18", // Texte principal
  feuille: "#2F8F5B", // Succès — confirmations
  piment: "#C0392B", // Erreur
  blanc: "#FFFFFF",
} as const;

/** Mode sombre complet basé sur le vert Kangan (section 11). */
export const darkColors = {
  vertKangan: "#123B2C",
  ocre: "#E4A748",
  terreCuite: "#C6653F",
  creme: "#15201A", // fond sombre
  encre: "#F3EFE6", // texte principal sur fond sombre
  feuille: "#3FAE72",
  piment: "#E0564A",
  blanc: "#0B120E",
} as const;

export const fontFamilies = {
  titles: "Fraunces", // serif chaleureuse, graisses 600/700
  body: "Plus Jakarta Sans", // texte et interface, graisses 400 à 700
  numbers: "Plus Jakarta Sans", // chiffres tabulaires pour les montants
} as const;

export const fontSizes = [12, 14, 16, 20, 24, 32, 48, 64] as const;
export const lineHeightBody = 1.5;

export const spacingUnit = 8; // grille de 8 points
export const mobileMargin = 20;
export const webContainerWidth = 1200;

export const radii = {
  field: 12,
  card: 20,
  pill: 999,
} as const;

export const shadows = {
  soft: "0 8px 24px rgba(27, 27, 24, 0.08)",
  hairlineBorder: "1px solid rgba(27, 27, 24, 0.08)",
} as const;

export const touchTarget = 48; // cibles tactiles minimum (accessibilité)

/** Motif tissé — utilisé en bordure de cartes, sur les relevés PDF et en filigrane (section 11). */
export const wovenPatternSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <path d="M0 20 L20 0 L40 20 L20 40 Z" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
  <path d="M0 0 L20 20 L0 40 M40 0 L20 20 L40 40" fill="none" stroke="currentColor" stroke-width="1" opacity="0.1"/>
</svg>`.trim();
