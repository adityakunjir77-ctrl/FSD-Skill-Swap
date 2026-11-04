import React, { useState } from 'react';

// Deterministic soft color palette for initials avatar
const AVATAR_PALETTES = [
  { bg: 'bg-[#E3EEEB]', text: 'text-[#0A4F4A]', border: 'border-[#B9D3CD]' },
  { bg: 'bg-[#F2EBDD]', text: 'text-[#6B4300]', border: 'border-[#DCCBA8]' },
  { bg: 'bg-[#E6E9EC]', text: 'text-[#2F3B47]', border: 'border-[#C5CCD3]' },
  { bg: 'bg-[#EFE6E3]', text: 'text-[#6E3527]', border: 'border-[#D8C3BC]' },
  { bg: 'bg-[#E9E7EF]', text: 'text-[#43395E]', border: 'border-[#CAC5D8]' },
  { bg: 'bg-[#E5ECE4]', text: 'text-[#2E5130]', border: 'border-[#C0D0BE]' },
];

function getPalette(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

function getInitials(name = '') {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  src,
  name = '',
  id = '',
  size = 'md',
  className = '',
  showOnline = false,
  isOnline = false,
}) {
  const [imageError, setImageError] = useState(false);
  const palette = getPalette(id || name || 'user');

  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
    '2xl': 'w-24 h-24 text-4xl',
  }[size] || 'w-10 h-10 text-base';

  const indicatorSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  }[size] || 'w-2.5 h-2.5';

  const hasImage = src && !imageError;

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {hasImage ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          onError={() => setImageError(true)}
          className={`${sizeStyles} rounded-card object-cover object-top border border-ink-primary/15`}
        />
      ) : (
        <div
          className={`${sizeStyles} rounded-card flex items-center justify-center font-display font-medium tracking-tight ${palette.bg} ${palette.text} border ${palette.border} select-none`}
          aria-label={name || 'User avatar'}
        >
          {getInitials(name)}
        </div>
      )}

      {showOnline && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${indicatorSize} rounded-full ring-2 ring-white ${
            isOnline ? 'bg-status-success' : 'bg-ink-muted'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

