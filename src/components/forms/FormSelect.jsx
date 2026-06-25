'use client';

import { ChevronDown } from 'lucide-react';

/**
 * Dark-theme styled <select> with a chevron and explicit option styling.
 *
 * - `appearance-none` removes the native arrow so we can render our own
 *   (the native arrow is invisible on dark backgrounds and breaks alignment)
 * - The <option> children are styled via a global rule in globals.css so the
 *   dropdown panel renders with dark zinc-900 background + zinc-100 text.
 *
 * Props: all standard <select> props plus `wrapperClassName` for layout.
 */
const FormSelect = ({ className = '', wrapperClassName = '', children, ...rest }) => (
  <div className={`relative ${wrapperClassName}`}>
    <select
      {...rest}
      className={`w-full appearance-none rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-2 pr-9 text-sm text-zinc-100 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 disabled:opacity-50 ${className}`}
    >
      {children}
    </select>
    <ChevronDown
      size={14}
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
    />
  </div>
);

export default FormSelect;