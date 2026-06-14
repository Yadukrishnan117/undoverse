/**
 * Tiny classnames joiner — filters falsy values and joins with spaces.
 * Keeps the UI package free of a clsx/tailwind-merge dependency.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
