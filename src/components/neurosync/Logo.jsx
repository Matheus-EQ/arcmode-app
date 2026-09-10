import React from 'react';

// NeuroSync logo — uses the official brand icon asset.
const LOGO_URL = '/IconNeuroSync.png';
const PROFESSIONAL_LOGO_URL = '/IconNeuroSyncProfessional.png';

export default function Logo({ size = 44, className = '', professional = false }) {
  return (
    <img
      src={professional ? PROFESSIONAL_LOGO_URL : LOGO_URL}
      alt="NeuroSync"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, display: 'block', objectFit: 'cover' }}
    />
  );
}
