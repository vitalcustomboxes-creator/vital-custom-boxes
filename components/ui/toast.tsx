"use client";

/**
 * components/ui/toast.tsx — Toast system (FE-1). DESIGN_SPEC §5.13.
 * <ToastProvider> (wrap once, near the root) + useToast() →
 * { toast, success, error, dismiss }. success/error variants, auto-dismiss
 * 5s (paused on hover/focus), aria-live polite (role="status") for success,
 * role="alert" for errors. Lifecycle: .toast-enter → .toast-exit → unmount on
 * animationend (timeout fallback). Viewport bottom-right, offset above the
 * StickyMobileCTA on mobile (spec). z-[var(--z-toast)].
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cx } from "./cn";
import { useMounted } from "./use-dialog";

export type ToastVariant = "success" | "error";

export interface ToastOptions {
  message: ReactNode;
  variant?: ToastVariant;
  /** ms until auto-dismiss; 0 disables. Default 5000. */
  duration?: number;
}

interface ToastItem {
  id: number;
  message: ReactNode;
  variant: ToastVariant;
  duration: number;
  dismissed: boolean;
}

export interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  success: (message: ReactNode, duration?: number) => number;
  error: (message: ReactNode, duration?: number) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return context;
}

const MAX_VISIBLE = 4;
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((options: ToastOptions): number => {
    const id = nextId++;
    setToasts((current) =>
      [
        ...current,
        {
          id,
          message: options.message,
          variant: options.variant ?? "success",
          duration: options.duration ?? 5000,
          dismissed: false,
        },
      ].slice(-MAX_VISIBLE)
    );
    return id;
  }, []);

  const success = useCallback(
    (message: ReactNode, duration?: number) =>
      toast({ message, variant: "success", duration }),
    [toast]
  );

  const error = useCallback(
    (message: ReactNode, duration?: number) =>
      toast({ message, variant: "error", duration }),
    [toast]
  );

  /** Triggers the exit animation; the card unmounts itself afterwards. */
  const dismiss = useCallback((id: number) => {
    setToasts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, dismissed: true } : item
      )
    );
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toast, success, error, dismiss }),
    [toast, success, error, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div
              className={cx(
                "pointer-events-none fixed inset-x-4 z-[var(--z-toast)] flex flex-col gap-2",
                "bottom-[calc(72px+env(safe-area-inset-bottom))]",
                "md:inset-x-auto md:bottom-6 md:right-6 md:w-[360px]"
              )}
            >
              {toasts.map((item) => (
                <ToastCard
                  key={item.id}
                  item={item}
                  onDismiss={dismiss}
                  onRemove={remove}
                />
              ))}
            </div>,
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
}

/**
 * Presentational toast card (exported per contract). Inside the provider it
 * is composed by ToastCard, which adds the auto-dismiss lifecycle; standalone
 * use is purely visual (e.g. inline confirmation panels).
 */
export interface ToastProps extends ComponentPropsWithoutRef<"div"> {
  variant?: ToastVariant;
  /** Renders the close button when provided. */
  onDismiss?: () => void;
  /** Applies .toast-exit instead of .toast-enter (unmount on animationend). */
  exiting?: boolean;
  dismissLabel?: string;
}

export function Toast({
  variant = "success",
  onDismiss,
  exiting = false,
  dismissLabel = "Dismiss notification",
  className,
  children,
  ...rest
}: ToastProps) {
  const isError = variant === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? undefined : "polite"}
      className={cx(
        "pointer-events-auto flex items-start gap-3 rounded-md border border-ink-100 bg-white px-4 py-3 text-sm text-ink-900 shadow-e3",
        exiting ? "toast-exit" : "toast-enter",
        className
      )}
      {...rest}
    >
      {isError ? (
        <CircleAlert
          size={20}
          className="mt-0.5 shrink-0 text-error"
          aria-hidden="true"
        />
      ) : (
        <CircleCheck
          size={20}
          className="mt-0.5 shrink-0 text-success"
          aria-hidden="true"
        />
      )}
      <div className="min-w-0 flex-1 pt-0.5">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="press -mr-1 -mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 transition-colors duration-150 ease-brand hover:bg-ink-100 hover:text-ink-900"
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/** Provider-internal: adds auto-dismiss (5s, paused on hover/focus). */
function ToastCard({
  item,
  onDismiss,
  onRemove,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const startedAtRef = useRef(0);
  const remainingRef = useRef(item.duration);

  const pause = useCallback(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
      remainingRef.current = Math.max(
        0,
        remainingRef.current - (Date.now() - startedAtRef.current)
      );
    }
  }, []);

  const resume = useCallback(() => {
    if (item.duration <= 0 || exiting || timerRef.current !== undefined) return;
    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(
      () => setExiting(true),
      remainingRef.current
    );
  }, [exiting, item.duration]);

  useEffect(() => {
    resume();
    return pause;
  }, [resume, pause]);

  useEffect(() => {
    if (item.dismissed) setExiting(true);
  }, [item.dismissed]);

  // Unmount after the exit animation; timeout fallback in case animationend
  // never fires (e.g. interrupted styles). Removal is idempotent.
  useEffect(() => {
    if (!exiting) return;
    const fallback = window.setTimeout(() => onRemove(item.id), 400);
    return () => window.clearTimeout(fallback);
  }, [exiting, item.id, onRemove]);

  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (exiting && event.target === event.currentTarget) onRemove(item.id);
  };

  return (
    <Toast
      variant={item.variant}
      exiting={exiting}
      onDismiss={() => onDismiss(item.id)}
      onAnimationEnd={onAnimationEnd}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      {item.message}
    </Toast>
  );
}
