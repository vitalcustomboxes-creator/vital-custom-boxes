"use client";

/**
 * components/ui/file-upload.tsx — FileUpload primitive (FE-1). DESIGN_SPEC §5.5.
 * Drag-drop + click-to-browse dropzone. Max 5 files, accepts images/PDF/AI/EPS
 * by default, "n of 5" count INSIDE the box, removable file chips below.
 * Controlled (files + onFilesChange) OR uncontrolled (omit both — internal
 * state; QuoteForm posts natively). Either way the hidden input's FileList is
 * kept in sync via DataTransfer, so server-action multipart FormData posts
 * always carry the merged drag+browse list (BE-3/FE-3 wiring).
 * Keyboard operable: the sr-only <input type="file"> inside the zone is the
 * real focus target (Enter/Space opens the picker natively); the visible
 * focus ring is drawn on the zone via has-[input:focus-visible].
 */
import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import { cx } from "./cn";
import { FieldError, FieldLabel, fieldIds } from "./field";

export interface FileUploadProps {
  /** Visible field label (audit — always labelled). */
  label: ReactNode;
  /** Controlled file list — omit (with onFilesChange) for uncontrolled use. */
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  /** Hard cap, default 5 (quote form contract). */
  maxFiles?: number;
  /** input accept string; default images + pdf/ai/eps. */
  accept?: string;
  /** Per-file size cap in MB, default 25 (spec hint). */
  maxSizeMb?: number;
  hint?: string;
  /** External (form-level) error — wins over internal skip notices. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  /** Forwarded to the hidden input for server-action form posts. */
  name?: string;
  /** Dropzone main line; default "Drag artwork here or browse". */
  prompt?: ReactNode;
  /** Extra classes for the outer wrapper (matches Input/Select API). */
  containerClassName?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

export function FileUpload({
  label,
  files: filesProp,
  onFilesChange,
  maxFiles = 5,
  accept = "image/*,.pdf,.ai,.eps",
  maxSizeMb = 25,
  hint = "PDF, AI, EPS, PNG or JPG — max 25 MB each",
  error,
  required,
  disabled,
  id: idProp,
  name,
  prompt,
  containerClassName,
}: FileUploadProps) {
  const autoId = useId();
  const id = idProp ?? `file-upload-${autoId}`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [skipNotice, setSkipNotice] = useState<string | null>(null);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const files = filesProp ?? internalFiles;

  /** Mirrors the canonical list into the input so FormData posts match. */
  const syncInput = (next: File[]) => {
    const input = inputRef.current;
    if (!input || typeof DataTransfer === "undefined") return;
    try {
      const dt = new DataTransfer();
      for (const file of next) dt.items.add(file);
      input.files = dt.files;
    } catch {
      /* engines without programmatic FileList assignment — skip */
    }
  };

  const setFiles = (next: File[]) => {
    if (filesProp === undefined) setInternalFiles(next);
    onFilesChange?.(next);
    syncInput(next);
  };

  const shownError = error ?? skipNotice ?? undefined;
  const { hintId, errorId, describedBy } = fieldIds(
    id,
    hint,
    shownError ? "x" : undefined
  );

  const addFiles = (incoming: FileList | File[]) => {
    if (disabled) return;
    const reasons: string[] = [];
    const next = [...files];
    for (const file of Array.from(incoming)) {
      if (!matchesAccept(file, accept)) {
        reasons.push(`${file.name} (unsupported type)`);
        continue;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        reasons.push(`${file.name} (over ${maxSizeMb} MB)`);
        continue;
      }
      if (next.some((f) => f.name === file.name && f.size === file.size)) {
        continue; // silent de-dupe
      }
      if (next.length >= maxFiles) {
        reasons.push(`${file.name} (over the ${maxFiles}-file limit)`);
        continue;
      }
      next.push(file);
    }
    if (next.length !== files.length) setFiles(next);
    setSkipNotice(reasons.length > 0 ? `Skipped: ${reasons.join(", ")}` : null);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    // No value reset — syncInput keeps the FileList canonical (form posts).
  };

  const onZoneClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.target !== inputRef.current) inputRef.current?.click();
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSkipNotice(null);
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className={cx("flex flex-col gap-1.5", containerClassName)}>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>

      {/* Dropzone — the sr-only input inside is the keyboard/focus target. */}
      <div
        data-drag={dragging ? "" : undefined}
        onClick={onZoneClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cx(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-white px-6 py-10 text-center",
          "transition-colors duration-200 ease-brand",
          "has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[var(--focus-ring-color)]",
          disabled
            ? "cursor-not-allowed border-ink-100 opacity-60"
            : shownError
              ? "cursor-pointer border-error bg-[rgba(179,64,42,0.06)]"
              : "cursor-pointer border-slate-400 hover:border-terra-500 hover:bg-terra-100 data-[drag]:border-terra-500 data-[drag]:bg-terra-100"
        )}
      >
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          multiple
          accept={accept}
          disabled={disabled}
          required={required && files.length === 0}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy}
          onChange={onInputChange}
          className="sr-only"
        />
        <CloudUpload size={28} className="text-slate-400" aria-hidden="true" />
        <span className="text-base font-semibold text-ink-700">
          {prompt ?? (
            <>
              Drag artwork here or{" "}
              <span className="text-terra-600 underline underline-offset-4">
                browse
              </span>
            </>
          )}
        </span>
        <span id={hintId} className="text-sm text-slate-600">
          {hint}
        </span>
        {/* Count INSIDE the box (task contract) — announced politely. */}
        <span aria-live="polite" className="text-sm font-semibold text-slate-600">
          {files.length} of {maxFiles} files
        </span>
      </div>

      {files.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-3 rounded-md border border-ink-100 bg-paper-50 px-4 py-3"
            >
              <FileText
                size={18}
                className="shrink-0 text-terra-600"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">
                {file.name}
              </span>
              <span className="shrink-0 whitespace-nowrap text-sm text-slate-600">
                {formatBytes(file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 transition-colors duration-150 ease-brand hover:bg-ink-100 hover:text-ink-900 disabled:pointer-events-none disabled:opacity-50"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {shownError ? (
        <div aria-live="polite">
          <FieldError id={errorId}>{shownError}</FieldError>
        </div>
      ) : null}
    </div>
  );
}
