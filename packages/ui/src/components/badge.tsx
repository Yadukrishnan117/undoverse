import * as React from "react";
import { cn } from "../lib/cn";

export type BadgeTone = "brand" | "accent" | "ok" | "warn" | "off" | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const TONE_VAR: Record<BadgeTone, string> = {
  brand: "var(--brand)",
  accent: "var(--accent)",
  ok: "var(--ok)",
  warn: "var(--warn)",
  off: "var(--off)",
  danger: "var(--danger)",
};

/**
 * Small status pill with a leading dot. Colour is driven by a brand token, so
 * it themes automatically.
 */
export function Badge({ tone = "brand", className, children, ...props }: BadgeProps) {
  const color = TONE_VAR[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        className,
      )}
      style={{ borderColor: color, color }}
      {...props}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      {children}
    </span>
  );
}
