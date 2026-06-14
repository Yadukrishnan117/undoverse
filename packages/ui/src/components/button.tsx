import * as React from "react";
import { cn } from "../lib/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "accent";
  size?: "sm" | "md";
}

/**
 * Brand button. Maps to the `.btn` classes defined in the app's globals so the
 * styling stays in one place; the variant just picks the modifier class.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn",
          variant === "primary" && "btn-primary",
          variant === "ghost" && "btn-ghost",
          variant === "accent" && "btn-accent",
          size === "sm" && "text-sm px-3 py-2",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
