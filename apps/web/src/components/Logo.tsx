import { CanariIcon } from "./CanariIcon";

export function Logo({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold ${className}`}>
      <CanariIcon percent={70} className={`h-8 w-8 ${dark ? "text-creme" : "text-vert-kangan"}`} />
      <span className={dark ? "text-creme" : "text-vert-kangan"}>
        Kangan <span className="text-ocre">Finance</span>
      </span>
    </span>
  );
}
