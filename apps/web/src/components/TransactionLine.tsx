import { formatDateShort, formatFcfa, type TransactionStatus, type TransactionType } from "@kangan/shared";

const TYPE_LABELS: Record<TransactionType, string> = {
  deposit: "Acompte",
  payment: "Versement",
  contribution: "Contribution",
  payout: "Reversement école",
  refund: "Remboursement",
  reversal: "Contre-écriture",
};

const STATUS_STYLES: Record<TransactionStatus, string> = {
  initiee: "text-ocre",
  reussie: "text-feuille",
  echouee: "text-piment",
  annulee: "text-encre/40",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  initiee: "En attente",
  reussie: "Réussi",
  echouee: "Échoué",
  annulee: "Annulé",
};

export function TransactionLine({
  type,
  amount,
  operator,
  status,
  createdAt,
}: {
  type: TransactionType;
  amount: number;
  operator: string;
  status: TransactionStatus;
  createdAt: string;
}) {
  const isCredit = ["deposit", "payment", "contribution"].includes(type);
  return (
    <div className="flex items-center justify-between border-b border-encre/8 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-encre">{TYPE_LABELS[type]}</p>
        <p className="text-xs text-encre/50">
          {formatDateShort(createdAt)} · {operator.replace("_", " ")}
        </p>
      </div>
      <div className="text-right">
        <p className={`font-semibold tabular-nums ${isCredit ? "text-vert-kangan" : "text-encre"}`}>
          {isCredit ? "+" : "−"}
          {formatFcfa(amount)}
        </p>
        <p className={`text-xs font-medium ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</p>
      </div>
    </div>
  );
}
