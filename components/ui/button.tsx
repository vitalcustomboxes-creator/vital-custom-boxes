/**
 * components/ui/button.tsx — Button primitive (FE-1). DESIGN_SPEC §5.1.
 * Server-compatible (no hooks/handlers defined here). `href` renders next/link
 * (internal) or <a> (external) with identical classes — the asChild-style
 * contract from the brief.
 *
 * Primary buttons pair the logo amber with dark ink text for strong contrast.
 *
 * `sheen` is reserved for the home-hero / CTABand primary CTA (max ONE visible
 * per viewport — spec §4). `onDark` switches secondary/ghost to their
 * .dark-section recipes (spec §5.1).
 */
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import {
  cloneElement,
  isValidElement,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, sets aria-busy, keeps the label, blocks interaction. */
  loading?: boolean;
  /** Use inside `.dark-section` — swaps secondary/ghost to dark recipes. */
  onDark?: boolean;
  fullWidth?: boolean;
  /** CTA sheen loop — home hero / CTABand primary ONLY (spec §4). */
  sheen?: boolean;
  /** Decorative icons; wrapped with aria-hidden. Size per spec: 18px (16 sm). */
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /**
   * Radix-style: merge button classes onto the single element child
   * (e.g. <Button asChild><Link href…>…</Link></Button>). loading/iconLeft/
   * iconRight are ignored in this mode — the child renders its own content.
   */
  asChild?: boolean;
}

type ButtonAsButton = ButtonOwnProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = ButtonOwnProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const OWN_KEYS = [
  "variant",
  "size",
  "loading",
  "onDark",
  "fullWidth",
  "sheen",
  "iconLeft",
  "iconRight",
  "asChild",
] as const;

type OwnKey = (typeof OWN_KEYS)[number];

function domProps<T extends object>(props: T): Omit<T, OwnKey> {
  const clone: Record<string, unknown> = { ...(props as Record<string, unknown>) };
  for (const key of OWN_KEYS) delete clone[key];
  return clone as Omit<T, OwnKey>;
}

const BASE =
  "press inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-display font-semibold transition-colors duration-200 ease-brand disabled:pointer-events-none disabled:opacity-50";

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-[52px] px-8 text-base",
};

function variantClasses(variant: ButtonVariant, onDark: boolean): string {
  switch (variant) {
    case "primary":
      return "bg-terra-500 text-ink-900 shadow-e1 hover:bg-ink-700 hover:text-white hover:shadow-e2";
    case "secondary":
      return onDark
        ? "border border-[var(--color-border-strong)] bg-transparent text-white hover:bg-white hover:text-ink-900"
        : "border border-ink-700 bg-transparent text-ink-700 hover:bg-ink-700 hover:text-white";
    case "ghost":
      return onDark
        ? "text-white hover:bg-white/10"
        : "text-ink-700 hover:bg-ink-100";
    case "link":
      return "h-auto rounded-none px-0 text-terra-600 underline underline-offset-4 hover:text-terra-500";
  }
}

function sizeClasses(variant: ButtonVariant, size: ButtonSize): string {
  if (variant === "link") {
    // Link variant has no box — only the type size applies (≥14px semibold).
    return size === "sm" ? "text-sm" : "text-base";
  }
  return SIZES[size];
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    onDark = false,
    fullWidth = false,
    sheen = false,
    iconLeft,
    iconRight,
  } = props;

  const classes = cx(
    BASE,
    sizeClasses(variant, size),
    variantClasses(variant, onDark),
    sheen && "sheen",
    fullWidth && "w-full"
  );

  const spinner = (
    <LoaderCircle
      size={size === "sm" ? 16 : 18}
      className="animate-spin"
      aria-hidden="true"
    />
  );

  const renderContent = (children: ReactNode) => (
    <>
      {loading ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {spinner}
        </span>
      ) : iconLeft ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {iconLeft}
        </span>
      ) : null}
      {children}
      {iconRight ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {iconRight}
        </span>
      ) : null}
    </>
  );

  if (props.asChild) {
    const { className, children } = props;
    if (isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        className: cx(classes, className, child.props.className),
      });
    }
    return null;
  }

  if (typeof props.href === "string") {
    const { href, className, children, target, rel, ...rest } = domProps(
      props as ButtonAsLink
    );
    const linkClasses = cx(classes, loading && "pointer-events-none", className);
    const shared = {
      className: linkClasses,
      target,
      "aria-busy": loading || undefined,
      "aria-disabled": loading || undefined,
      tabIndex: loading ? -1 : undefined,
    };
    // Internal routes go through next/link; external/mailto/tel/# use <a>.
    if (href.startsWith("/") && !href.startsWith("//")) {
      return (
        <Link href={href} rel={rel} {...shared} {...rest}>
          {renderContent(children)}
        </Link>
      );
    }
    return (
      <a
        href={href}
        rel={target === "_blank" ? rel ?? "noopener noreferrer" : rel}
        {...shared}
        {...rest}
      >
        {renderContent(children)}
      </a>
    );
  }

  const { className, children, type, disabled, ...rest } = domProps(
    props as ButtonAsButton
  );
  return (
    <button
      type={type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(classes, className)}
      {...rest}
    >
      {renderContent(children)}
    </button>
  );
}
