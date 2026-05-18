import { ESTADO_ACTUAL, ESTADO_COLOR } from "@/lib/enums";

export function EstadoBadge({ estado }: { estado: number }) {
  return (
    <span className={ESTADO_COLOR[estado] || "badge-gray"}>
      {ESTADO_ACTUAL[estado] ?? `Estado ${estado}`}
    </span>
  );
}

type Variant = "info" | "success" | "warning" | "error" | "gray";

const VARIANT: Record<Variant, string> = {
  info: "badge-blue",
  success: "badge-green",
  warning: "badge-yellow",
  error: "badge-red",
  gray: "badge-gray",
};

export function Badge({ variant = "gray", children }: { variant?: Variant; children: React.ReactNode }) {
  return <span className={VARIANT[variant]}>{children}</span>;
}
