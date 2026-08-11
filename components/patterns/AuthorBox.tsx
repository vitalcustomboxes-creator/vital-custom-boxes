/**
 * AuthorBox — Server Component (FE-3). Blog post byline panel.
 *
 * Posts carry no author field (lib/types.ts Post), so the default byline is
 * the in-house team — NO invented personas, NO stock-photo faces (audit:
 * no fabricated content). Avatar = monogram chip; pass real author details
 * via props once the client supplies them.
 */
import { cn } from '@/lib/utils';

export interface AuthorBoxProps {
  name?: string;
  role?: string;
  bio?: string;
  className?: string;
}

const DEFAULTS = {
  name: 'Vital Custom Boxes Team',
  role: 'Packaging & print specialists',
  bio: 'Articles from our in-house team — the packaging engineers, prepress techs, and designers who build custom boxes for brands every day.',
};

export function AuthorBox({
  name = DEFAULTS.name,
  role = DEFAULTS.role,
  bio = DEFAULTS.bio,
  className,
}: AuthorBoxProps) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      aria-label={`About the author: ${name}`}
      className={cn(
        'flex items-start gap-4 rounded-lg border border-ink-100 bg-white p-6 shadow-e1',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-terra-100 font-display text-base font-bold text-terra-600"
      >
        {initials}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-display text-base font-semibold text-ink-900">{name}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
          {role}
        </p>
        <p className="mt-1 text-sm text-slate-600">{bio}</p>
      </div>
    </aside>
  );
}

export default AuthorBox;
