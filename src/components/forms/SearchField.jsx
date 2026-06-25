'use client';

import { Search } from 'lucide-react';

/**
 * Dark-theme styled search input with a leading magnifying-glass icon.
 * Matches FormSelect's visual language (border-white/10, bg-zinc-900/60).
 */
const SearchField = ({ className = '', wrapperClassName = '', ...rest }) => (
  <div className={`relative ${wrapperClassName}`}>
    <Search
      size={14}
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
    />
    <input
      type="text"
      {...rest}
      className={`w-full rounded-lg border border-white/10 bg-zinc-900/60 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 ${className}`}
    />
  </div>
);

export default SearchField;