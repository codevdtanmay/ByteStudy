import React from 'react';

/** Compact ByteCollege mark recreated as a theme-safe vector. */
export default function BrandLogo({ showName = false, className = '' }) {
  return (
    <span className={`brand-logo ${showName ? 'brand-logo-with-name' : ''} ${className}`} aria-label="ByteCollege">
      <svg className="brand-logo-icon" viewBox="0 0 48 48" aria-hidden="true">
        <path className="brand-logo-book" d="M8 12.5 18 7v27L8 40.5zM19.5 8.2 25 5v27l-5.5 3.2zM27 6.4 31 4v27l-4 2.3z" />
        <path className="brand-logo-b" d="M32 8h5.2C42.1 8 45 10.2 45 14c0 2.4-1.1 4-3.2 5.2 2.7.9 4.2 2.8 4.2 5.8 0 4.5-3.4 7-8.6 7H32v-5h4.7c2.4 0 3.7-.8 3.7-2.5 0-1.8-1.3-2.5-3.7-2.5H32v-4.7h4.1c2.1 0 3.2-.8 3.2-2.3 0-1.4-1.1-2.2-3.2-2.2H32z" />
      </svg>
      {showName && <span className="brand-logo-name"><strong>Byte<span>College</span></strong><small>LEARN TODAY · BUILD TOMORROW</small></span>}
    </span>
  );
}
