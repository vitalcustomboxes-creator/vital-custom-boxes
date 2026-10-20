/** Floating WhatsApp launcher. WhatsApp uses a separate business number. */
import type { Globals } from '@/lib/types';

const DEFAULT_MESSAGE =
  "Hi! I'm interested in custom packaging boxes. Can you help me?";

export interface WhatsAppButtonProps {
  globals: Globals;
  message?: string;
}

export function WhatsAppButton({ message = DEFAULT_MESSAGE }: WhatsAppButtonProps) {
  // WhatsApp: +1 (610) 998-8971. The call number remains in globals.
  const digits = '16109988971';
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <a
  href={href}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Chat with us on WhatsApp"
  className="press fixed left-5 bottom-28 z-[var(--z-header)] flex h-17 w-17 items-center justify-center rounded-full bg-[#25D366] text-white shadow-e3 transition-transform duration-150 ease-brand hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
>
  {/* Pulse ring */}
  <span
    aria-hidden="true"
    className="absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping"
  />
  <svg
    viewBox="0 0 32 32"
    width="80"
    height="80"
    fill="currentColor"
    aria-hidden="true"
  >
            <path d="M16.04 4C9.96 4 5 8.95 5 15.02c0 2.12.6 4.1 1.64 5.79L5 28l7.36-1.6a11 11 0 0 0 3.68.63h.01C22.13 27.03 27.1 22.08 27.1 16 27.1 8.95 22.12 4 16.04 4Zm0 20.2c-1.13 0-2.24-.2-3.28-.6l-.24-.1-4.37.95.93-4.26-.16-.25a9.1 9.1 0 0 1-1.4-4.85c0-5.03 4.1-9.12 9.13-9.12 2.44 0 4.73.95 6.45 2.67a9.06 9.06 0 0 1 2.68 6.46c0 5.03-4.1 9.12-9.13 9.12Zm5.01-6.83c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.14-.62.14-.18.27-.71.88-.87 1.06-.16.18-.32.2-.59.07-.27-.14-1.16-.43-2.2-1.36-.81-.72-1.36-1.62-1.52-1.89-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.46-.62-.47l-.53-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.66.21 1.25.18 1.72.11.53-.08 1.62-.66 1.85-1.3.23-.64.23-1.18.16-1.3-.07-.12-.25-.18-.52-.32Z" />

  </svg>
</a>
  );
}
