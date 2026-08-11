/**
 * components/ui/cn.ts — tiny class joiner (FE-1).
 * No clsx/tailwind-merge dependency by design (keep first-load JS lean).
 */
export type ClassValue = string | number | null | undefined | false;

export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
