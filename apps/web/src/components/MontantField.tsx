"use client";

import type { InputHTMLAttributes, Ref } from "react";
import { formatAmount } from "@kangan/shared";

interface MontantFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | "";
  onChange: (value: number) => void;
  label?: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

/** Champ de saisie de montant F CFA — chiffres tabulaires, cible tactile 48px. */
export function MontantField({ value, onChange, label, hint, error, className = "", ref, ...props }: MontantFieldProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-encre">{label}</span>}
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={value === "" ? "" : formatAmount(value)}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, "");
            onChange(digits === "" ? 0 : Number(digits));
          }}
          className={`h-12 w-full rounded-field border px-4 pr-16 text-lg font-semibold tabular-nums text-encre placeholder:text-encre/30 focus-ring ${
            error ? "border-piment" : "border-encre/15"
          } ${className}`}
          {...props}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-encre/40">
          F CFA
        </span>
      </div>
      {hint && !error && <p className="mt-1 text-xs text-encre/50">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-piment">{error}</p>}
    </label>
  );
}
