/**
 * @undoverse/ui — shared, framework-light UI primitives.
 *
 * These are intentionally tiny and dependency-free so any app in the monorepo
 * can pull them in. They lean on the same CSS variables defined in
 * `tokens.css`, so they inherit the brand automatically.
 */

export { cn } from "./lib/cn";
export { Badge } from "./components/badge";
export { Button } from "./components/button";
export type { ButtonProps } from "./components/button";
export type { BadgeProps, BadgeTone } from "./components/badge";
