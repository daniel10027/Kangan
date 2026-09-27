import Link from "next/link";
import { formatFcfa, daysUntilDeadline, type SavingsBoxStatus } from "@kangan/shared";
import { CanariIcon } from "./CanariIcon";
import { StatusBadge } from "./StatusBadge";

export interface CaisseCardProps {
  id: string;
  reference: string;
  studentName: string;
  schoolName: string;
  status: SavingsBoxStatus;
  balance: number;
  targetAmount: number;
  percent: number;
  deadline: string;
  color?: string;
}

/** Carte caisse — utilisée sur l'accueil parent (P5) et la liste école (E5). */
export function CaisseCard(props: CaisseCardProps) {
  const daysLeft = daysUntilDeadline(props.deadline);

  return (
    <Link
      href={`/parent/caisses/${props.id}`}
      className="group block rounded-card border border-encre/10 bg-white p-5 shadow-soft transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${props.color ?? "#0F3D2E"}1A`, color: props.color ?? "#0F3D2E" }}
          >
            <CanariIcon percent={props.percent} className="h-7 w-7" />
          </div>
          <div>
            <p className="font-display font-bold text-encre">{props.studentName}</p>
            <p className="text-sm text-encre/60">{props.schoolName}</p>
          </div>
        </div>
        <StatusBadge status={props.status} />
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-pill bg-encre/10">
          <div
            className="h-full rounded-pill bg-ocre transition-all"
            style={{ width: `${Math.min(props.percent, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-vert-kangan">{formatFcfa(props.balance)}</span>
          <span className="text-encre/50">sur {formatFcfa(props.targetAmount)}</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-encre/50">
        {daysLeft >= 0 ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restants` : "Échéance dépassée"} · {props.reference}
      </p>
    </Link>
  );
}
