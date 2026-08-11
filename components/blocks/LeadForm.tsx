"use client";

/**
 * components/blocks/LeadForm.tsx — small lead-capture form (owner: BE-2).
 * Used by /contact/ (submitContact) and /samples/ (submitSample).
 *
 * BE-3's server actions return `{ ok, error? }` and do NOT redirect, so this
 * client wrapper mirrors FE-3's QuoteForm behaviour: success → /thank-you/,
 * failure → inline alert (role="alert"). Field config is serializable, so
 * server pages can declare the fields and pass them straight through.
 *
 * Audit hooks: visible labels via ui primitives (§5.2); honeypot field shared
 * with BE-3 (lib/forms HONEYPOT_FIELD); pending state keeps the label.
 */
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import {
  getCountryCallingCode,
  parsePhoneNumber,
  type Country as PhoneCountry,
  type Value as PhoneValue,
} from "react-phone-number-input";
import {
  Button,
  CountryDropdown,
  Input,
  PhoneNumberInput,
  Textarea,
  type CountryOption,
} from "@/components/ui";
import { countryByCode } from "@/components/ui/country-dropdown";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { HONEYPOT_FIELD, type ActionResult } from "@/lib/forms";

export interface LeadFormField {
  kind: "input" | "textarea" | "phone" | "country";
  name: string;
  label: string;
  /** input only — defaults to "text". */
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  /** Example text only — never the label (audit). */
  placeholder?: string;
  rows?: number;
}

export interface LeadFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  fields: LeadFormField[];
  submitLabel: string;
  /** id prefix so two forms on one page never collide. */
  idPrefix: string;
}

export function LeadForm({ action, fields, submitLabel, idPrefix }: LeadFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmationData, setConfirmationData] = useState<FormData | null>(null);
  const [phone, setPhone] = useState<PhoneValue>();
  const [country, setCountry] = useState<CountryOption | null>(null);
  const hasSynchronized = useRef(false);
  const autoFilledPhonePrefix = useRef<string | null>(null);

  const fillCountryOnce = (countryCode?: PhoneCountry) => {
    if (!countryCode || country || hasSynchronized.current) return;
    const detectedCountry = countryByCode(countryCode);
    if (!detectedCountry) return;
    hasSynchronized.current = true;
    setCountry(detectedCountry);
  };

  const handlePhoneChange = (value?: PhoneValue) => {
    // E.164 allows at most 15 digits. The phone component also applies the
    // selected country's shorter mask; this remains the international fallback.
    if (value && value.replace(/\D/g, "").length > 15) return;
    setPhone(value);
    if (!value || country || hasSynchronized.current) return;
    fillCountryOnce(parsePhoneNumber(value)?.country);
  };

  const handleCountryChange = (nextCountry: CountryOption | null) => {
    setCountry(nextCountry);
    if (!nextCountry || phone || hasSynchronized.current) return;
    const prefix = `+${getCountryCallingCode(nextCountry.alpha2)}` as PhoneValue;
    hasSynchronized.current = true;
    autoFilledPhonePrefix.current = prefix;
    setPhone(prefix);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const requiredCountry = fields.find(
      (field) => field.kind === "country" && field.required,
    );
    if (requiredCountry && !country) {
      setError("Please choose a country from the list.");
      document.getElementById(`${idPrefix}-${requiredCountry.name}`)?.focus();
      return;
    }

    const formData = new FormData(event.currentTarget);
    const phoneField = fields.find((field) => field.kind === "phone");
    if (
      phoneField &&
      autoFilledPhonePrefix.current &&
      formData.get(phoneField.name) === autoFilledPhonePrefix.current
    ) {
      // A country-only calling code is a useful input affordance, not a phone number.
      formData.set(phoneField.name, "");
    }
    setError(null);
    setConfirmationData(formData);
  };

  const sendConfirmed = async () => {
    if (!confirmationData || pending) return;
    setError(null);
    setPending(true);
    try {
      const result = await action(confirmationData);
      if (result.ok) {
        router.push("/thank-you/");
        return;
      }
      setError(
        result.error ??
          "Something went wrong on our end. Please try again, or email us directly.",
      );
    } catch {
      setError("We could not send your request. Please check your connection and try again.");
    }
    setPending(false);
    setConfirmationData(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {/* Honeypot — humans never see it; bots fill it (BE-3 drops those). */}
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {fields.map((field) =>
        field.kind === "textarea" ? (
          <Textarea
            key={field.name}
            id={`${idPrefix}-${field.name}`}
            name={field.name}
            label={field.label}
            required={field.required}
            autoComplete={field.autoComplete}
            hint={field.hint}
            placeholder={field.placeholder}
            rows={field.rows ?? 5}
          />
        ) : field.kind === "phone" ? (
          <PhoneNumberInput
            key={field.name}
            id={`${idPrefix}-${field.name}`}
            name={field.name}
            label={field.label}
            value={phone}
            onChange={handlePhoneChange}
            onCountryChange={fillCountryOnce}
            required={field.required}
            autoComplete={field.autoComplete}
            hint={field.hint}
            placeholder={field.placeholder}
          />
        ) : field.kind === "country" ? (
          <CountryDropdown
            key={field.name}
            id={`${idPrefix}-${field.name}`}
            name={field.name}
            label={field.label}
            value={country}
            onChange={handleCountryChange}
            required={field.required}
            hint={field.hint}
          />
        ) : (
          <Input
            key={field.name}
            id={`${idPrefix}-${field.name}`}
            name={field.name}
            label={field.label}
            type={field.type ?? "text"}
            required={field.required}
            autoComplete={field.autoComplete}
            hint={field.hint}
            placeholder={field.placeholder}
          />
        ),
      )}

      {error ? (
        <p role="alert" className="flex items-start gap-1.5 text-sm text-error">
          <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end">
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {submitLabel}
        </Button>
      </div>
      <ConfirmDialog open={confirmationData !== null} onClose={() => setConfirmationData(null)} onConfirm={() => { void sendConfirmed(); }} title="Send this request?" description="Please confirm that the information you entered is ready to be sent to our team." pending={pending} />
    </form>
  );
}
