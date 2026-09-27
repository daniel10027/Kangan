import type { ReactNode } from "react";

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-encre/15 bg-white/50 px-6 py-14 text-center">
      {icon && <div className="mb-4 text-vert-kangan/40">{icon}</div>}
      <p className="font-display text-lg font-semibold text-encre">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-encre/60">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
