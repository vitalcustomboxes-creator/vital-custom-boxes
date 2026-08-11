/**
 * components/ui/field.tsx — shared form-field scaffolding (FE-1, internal).
 * Implements DESIGN_SPEC §5.2: VISIBLE label (audit), hint + error wiring via
 * aria-describedby, error icon row. Server-compatible (no hooks, no handlers).
 * Not exported from the barrel — Input/Textarea/Select/RadioGroup/FileUpload
 * compose these pieces.
 */
import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

/** Builds the stable hint/error ids + the aria-describedby string (error first). */
export function fieldIds(
  id: string,
  hint?: ReactNode,
  error?: ReactNode,
  external?: string
): { hintId?: string; errorId?: string; describedBy?: string } {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [errorId, hintId, external].filter(Boolean).join(" ") || undefined;
  return { hintId, errorId, describedBy };
}

export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-700">
      {children}
      {required ? (
        <span className="text-terra-600" aria-hidden="true">
          {" "}
          *
        </span>
      ) : null}
    </label>
  );
}

export function FieldHint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-sm text-slate-600">
      {children}
    </p>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-sm text-error">
      <CircleAlert size={16} aria-hidden="true" className="shrink-0" />
      {children}
    </p>
  );
}

/* Input chrome (DESIGN_SPEC §5.2) split so the error state replaces the
   border/halo pieces instead of fighting them in the cascade. */
export const inputChromeBase =
  "w-full rounded-md border bg-white px-4 text-base text-ink-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-kraft-100 disabled:text-slate-400 transition-[border-color,box-shadow] duration-200 ease-brand";

export const inputStateDefault =
  "border-ink-100 hover:border-slate-400 disabled:hover:border-ink-100 focus:border-terra-500 focus:shadow-[0_0_0_3px_var(--color-terra-100)]";

export const inputStateError =
  "border-error hover:border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(179,64,42,0.12)]";
