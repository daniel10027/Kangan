import type { SavingsBoxStatus } from "@kangan/shared";

const CONFIG: Record<SavingsBoxStatus, { label: string; className: string }> = {
  brouillon: { label: "Brouillon", className: "bg-encre/10 text-encre" },
  en_attente: { label: "En attente", className: "bg-ocre/20 text-terre-cuite" },
  active: { label: "Active", className: "bg-feuille/15 text-feuille" },
  completee: { label: "Complétée", className: "bg-vert-kangan text-creme" },
  reversee: { label: "Reversée", className: "bg-vert-kangan/10 text-vert-kangan" },
  suspendue: { label: "Suspendue", className: "bg-piment/15 text-piment" },
  remboursee: { label: "Remboursée", className: "bg-encre/10 text-encre" },
};

export function StatusBadge({ status }: { status: SavingsBoxStatus }) {
  const config = CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
