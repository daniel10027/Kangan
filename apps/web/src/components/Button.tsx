import type { ButtonHTMLAttributes, Ref } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-vert-kangan text-creme hover:bg-vert-kangan/90 disabled:bg-vert-kangan/40",
  secondary: "bg-ocre text-vert-kangan hover:bg-ocre/90 disabled:bg-ocre/40",
  ghost: "bg-transparent text-vert-kangan hover:bg-vert-kangan/5 border border-encre/10",
  danger: "bg-piment text-creme hover:bg-piment/90 disabled:bg-piment/40",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2 min-h-[40px]",
  md: "text-base px-5 py-3 min-h-[48px]",
  lg: "text-lg px-7 py-4 min-h-[56px]",
};

export function Button({ variant = "primary", size = "md", loading, className = "", children, disabled, ref, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-field font-semibold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
