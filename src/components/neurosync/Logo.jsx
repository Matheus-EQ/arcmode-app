import React from 'react';

// ArcMode logo — one journey, with Professional and RPG experiences.
const LOGO_URL = '/IconArcMode-512.png';

export default function Logo({ size = 44, className = '' }) {
  return (
    <img
      src={LOGO_URL}
      alt="ArcMode"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, display: 'block', objectFit: 'contain' }}
    />
  );
}
