/**
 * Illustration originale (trait épais, aplats ocre/vert, section 11) d'une
 * mère et sa fille en uniforme scolaire — remplace la photographie réelle
 * (shooting Abidjan) tant qu'aucun shooting n'a eu lieu, conformément à la
 * tolérance explicite du cahier des charges section 16.
 */
export function HeroIllustration() {
  return (
    <svg viewBox="0 0 400 420" className="h-full w-full" role="img" aria-label="Illustration d'une mère et sa fille en uniforme scolaire">
      <rect x="0" y="340" width="400" height="80" fill="#0F3D2E" opacity="0.06" />
      {/* Mère */}
      <g>
        <circle cx="140" cy="120" r="38" fill="#B5502F" />
        <path d="M140 82c14 0 28 10 28 26-10-6-46-6-56 0 0-16 14-26 28-26z" fill="#1B1B18" />
        <rect x="100" y="150" width="80" height="140" rx="26" fill="#0F3D2E" />
        <rect x="100" y="150" width="80" height="30" rx="14" fill="#D98E2B" />
        <rect x="70" y="170" width="26" height="90" rx="13" fill="#0F3D2E" />
        <rect x="184" y="170" width="26" height="90" rx="13" fill="#0F3D2E" />
      </g>
      {/* Fille en uniforme */}
      <g transform="translate(190, 60)">
        <circle cx="70" cy="90" r="30" fill="#B5502F" />
        <path d="M70 60c11 0 22 8 22 20-9-5-35-5-44 0 0-12 11-20 22-20z" fill="#1B1B18" />
        <rect x="42" y="118" width="56" height="110" rx="20" fill="#D98E2B" />
        <rect x="42" y="118" width="56" height="22" rx="10" fill="#F6EFE3" />
        <rect x="20" y="132" width="20" height="70" rx="10" fill="#D98E2B" />
        <rect x="100" y="132" width="20" height="70" rx="10" fill="#D98E2B" />
        {/* Cartable */}
        <rect x="96" y="140" width="26" height="34" rx="6" fill="#0F3D2E" />
      </g>
      {/* Sol / marché stylisé */}
      <path d="M0 340c60-14 340-14 400 0v10H0z" fill="#D98E2B" opacity="0.15" />
    </svg>
  );
}
