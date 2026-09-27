/**
 * Le canari — jarre en terre cuite qui se remplit goutte à goutte, symbole
 * central de la direction artistique (section 11) : "chaque caisse est un
 * canari qui monte vers la rentrée."
 */
export function CanariIcon({ className = "", percent = 0 }: { className?: string; percent?: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillHeight = (clamped / 100) * 30; // hauteur max de remplissage dans le viewBox
  const fillY = 44 - fillHeight;

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <clipPath id={`canari-clip-${clamped}`}>
          <path d="M18 30a14 14 0 0 0 28 0v10a14 14 0 0 1-28 0V30z" />
        </clipPath>
      </defs>
      <path d="M24 8h16v6a4 4 0 0 1-2 3.5V22a12 12 0 0 1 8 11.3V40a10 10 0 0 1-10 10h-8a10 10 0 0 1-10-10v-6.7A12 12 0 0 1 26 17.5V14a4 4 0 0 1-2-3.5V8z" fill="none" stroke="currentColor" strokeWidth="2" />
      <g clipPath={`url(#canari-clip-${clamped})`}>
        <rect x="16" y={fillY} width="32" height="30" fill="currentColor" opacity="0.85" />
      </g>
    </svg>
  );
}
