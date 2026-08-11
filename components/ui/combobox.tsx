"use client";

/**
 * components/ui/combobox.tsx — searchable single-select (FE-1 field contract).
 *
 * Native <select> (./select.tsx) cannot filter, and @radix-ui/react-dropdown-menu
 * is a menu, not a combobox — so this implements the WAI-ARIA combobox pattern
 * directly: a text input (role="combobox") over a popover listbox, with
 * aria-activedescendant tracking the highlighted option.
 *
 * Chrome is composed from ./field.tsx so it is visually identical to
 * Input/Select. Catalog-agnostic on purpose: `options` are plain {value,label}
 * records, so any flat list (products, related slugs, …) fits. Matches are
 * ranked by relevance — see rankOf below.
 */

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown, X } from "lucide-react";
import { cx } from "./cn";
import {
  FieldError,
  FieldHint,
  FieldLabel,
  fieldIds,
  inputChromeBase,
  inputStateDefault,
  inputStateError,
} from "./field";

export interface ComboboxOption {
  value: string;
  label: string;
}

/**
 * Relevance scoring. Plain substring filtering buries the option the user is
 * actually typing the name of: for "mailer", alphabetical order puts "Custom
 * Mailer Boxes" behind "Custom Black/Cardboard/Corrugated Mailer Boxes".
 *
 * Tier alone doesn't settle it — all four are word-start matches — so ties
 * break on where the match lands (earlier wins) and then on label length
 * (shorter wins), which floats the plain "Custom Mailer Boxes" to the top.
 */
const NO_MATCH = -1;

function tierOf(haystack: string, needle: string): number {
  if (haystack === needle) return 0;
  if (haystack.startsWith(needle)) return 1;
  // A match at the start of any word beats one buried mid-word.
  if (haystack.split(/\s+/).some((word) => word.startsWith(needle))) return 2;
  if (haystack.includes(needle)) return 3;
  return NO_MATCH;
}

function scoreOf(label: string, needle: string) {
  const haystack = label.toLowerCase();
  return {
    tier: tierOf(haystack, needle),
    index: haystack.indexOf(needle),
    length: haystack.length,
  };
}

export interface ComboboxProps {
  label: ReactNode;
  options: ComboboxOption[];
  /** Selected option value, or null when cleared. Controlled. */
  value: string | null;
  onChange: (option: ComboboxOption | null) => void;
  /**
   * Fires the first time the user focuses or types — lets the owner defer
   * loading `options` until the field is actually used.
   */
  onOpen?: () => void;
  id?: string;
  placeholder?: string;
  /** Shown when the filter matches nothing. */
  emptyLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  containerClassName?: string;
  /** Cap on rendered rows — the rest are reachable by narrowing the query. */
  maxVisible?: number;
  /** Optional visual placed before the selected value and every option. */
  renderLeading?: (option: ComboboxOption) => ReactNode;
}

const DEFAULT_MAX_VISIBLE = 50;

export function Combobox({
  label,
  options,
  value,
  onChange,
  onOpen,
  id: idProp,
  placeholder,
  emptyLabel = "No matches found",
  loading = false,
  loadingLabel = "Loading…",
  disabled = false,
  required = false,
  error,
  hint,
  containerClassName,
  maxVisible = DEFAULT_MAX_VISIBLE,
  renderLeading,
}: ComboboxProps) {
  const autoId = useId();
  const id = idProp ?? `combobox-${autoId}`;
  const listboxId = `${id}-listbox`;
  const { hintId, errorId, describedBy } = fieldIds(id, hint, error);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const opened = useRef(false);

  const [open, setOpen] = useState(false);
  // `null` while the committed label is displayed; a string once the user types.
  const [draft, setDraft] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  /* The committed label wins until the user starts typing, so a value selected
     before `options` arrived (e.g. a product-page prefill) still reads back. */
  const displayLabel = selected?.label ?? "";
  const text = draft ?? displayLabel;

  const matches = useMemo(() => {
    const needle = (draft ?? "").trim().toLowerCase();
    if (!needle) return options;
    return options
      .map((option) => ({ option, ...scoreOf(option.label, needle) }))
      .filter((entry) => entry.tier !== NO_MATCH)
      // Sort is stable, so equal scores keep the incoming (alphabetical) order.
      .sort(
        (a, b) => a.tier - b.tier || a.index - b.index || a.length - b.length,
      )
      .map((entry) => entry.option);
  }, [options, draft]);

  const visible = matches.slice(0, maxVisible);
  const hiddenCount = matches.length - visible.length;

  // Keep the highlight inside the (possibly shrunken) match list.
  useEffect(() => {
    setActive((current) => (current < visible.length ? current : 0));
  }, [visible.length]);

  // Scroll the highlighted row into view as the user arrows through.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // Click-outside closes and reverts to the committed label.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const requestOptions = () => {
    if (opened.current) return;
    opened.current = true;
    onOpen?.();
  };

  const close = () => {
    setOpen(false);
    setDraft(null);
  };

  const commit = (option: ComboboxOption | null) => {
    onChange(option);
    setOpen(false);
    setDraft(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      requestOptions();
      if (!open) {
        setOpen(true);
        return;
      }
      if (visible.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + visible.length) % visible.length);
      return;
    }
    if (event.key === "Enter") {
      if (!open) return;
      // Swallow Enter so an open listbox never submits the surrounding form.
      event.preventDefault();
      const option = visible[active];
      if (option) commit(option);
      return;
    }
    if (event.key === "Escape") {
      if (!open) return;
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "Tab") close();
  };

  return (
    <div
      ref={rootRef}
      className={cx("relative flex flex-col gap-1.5", containerClassName)}
    >
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          value={text}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && visible[active] ? `${id}-option-${active}` : undefined
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onFocus={requestOptions}
          onChange={(event) => {
            requestOptions();
            setDraft(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onClick={() => {
            requestOptions();
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={cx(
            "h-11 cursor-text",
            inputChromeBase,
            selected && renderLeading ? "pl-11" : undefined,
            selected ? "pr-20" : "pr-10",
            error ? inputStateError : inputStateDefault,
          )}
        />

        {selected && renderLeading ? (
          <span
            className="pointer-events-none absolute left-3 top-1/2 inline-flex -translate-y-1/2 items-center"
            aria-hidden="true"
          >
            {renderLeading(selected)}
          </span>
        ) : null}

        {selected && !disabled ? (
          <button
            type="button"
            onClick={() => {
              commit(null);
              inputRef.current?.focus();
            }}
            aria-label={`Clear ${typeof label === "string" ? label.toLowerCase() : "selection"}`}
            className="absolute right-9 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-slate-400 transition-colors hover:text-ink-900 focus:outline-none focus:ring-2 focus:ring-terra-100"
          >
            <X size={15} aria-hidden="true" />
          </button>
        ) : null}

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />

        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={typeof label === "string" ? label : undefined}
          hidden={!open}
          data-lenis-prevent
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-72 overflow-y-auto rounded-md border border-ink-100 bg-white py-1 shadow-e2"
        >
          {loading ? (
            <li className="px-4 py-3 text-sm text-slate-500">{loadingLabel}</li>
          ) : visible.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">{emptyLabel}</li>
          ) : (
            visible.map((option, index) => (
              <li key={option.value}>
                <button
                  type="button"
                  id={`${id}-option-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={option.value === value}
                  // Keep focus in the input so aria-activedescendant stays authoritative.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => commit(option)}
                  className={cx(
                    "flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors",
                    index === active
                      ? "bg-kraft-100 text-ink-900"
                      : "text-slate-700",
                    option.value === value && "font-semibold",
                  )}
                >
                  {renderLeading ? (
                    <span className="inline-flex shrink-0" aria-hidden="true">
                      {renderLeading(option)}
                    </span>
                  ) : null}
                  <span className="min-w-0 truncate">{option.label}</span>
                </button>
              </li>
            ))
          )}

          {hiddenCount > 0 ? (
            <li
              role="presentation"
              className="border-t border-ink-100 px-4 py-2 text-xs text-slate-500"
            >
              {hiddenCount} more — keep typing to narrow the list.
            </li>
          ) : null}
        </ul>
      </div>

      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
    </div>
  );
}
