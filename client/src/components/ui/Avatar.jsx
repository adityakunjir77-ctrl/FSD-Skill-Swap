import React, { useState } from 'react';

// Deterministic soft color palette for initials avatar
const AVATAR_PALETTES = [
  { bg: 'bg-[#E6F6F3]', text: 'text-[#0F766E]', border: 'border-[#BCECE3]' },
  { bg: 'bg-[#FFF1DB]', text: 'text-[#9A5B00]', border: 'border-[#FCE2B6]' },
  { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', border: 'border-[#BAE6FD]' },
  { bg: 'bg-[#FEECE8]', text: 'text-[#F2674A]', border: 'border-[#FED7CE]' },
  { bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]', border: 'border-[#E9D5FF]' },
  { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]' },
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
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-semibold',
    xl: 'w-16 h-16 text-lg font-bold',
    '2xl': 'w-24 h-24 text-2xl font-bold',
  }[size] || 'w-10 h-10 text-sm font-semibold';

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
          className={`${sizeStyles} rounded-full object-cover border border-canvas-border`}
        />
      ) : (
        <div
          className={`${sizeStyles} rounded-full flex items-center justify-center font-heading ${palette.bg} ${palette.text} border ${palette.border} select-none`}
          aria-label={name || 'User avatar'}
        >
          {getInitials(name)}
        </div>
      )}

      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 ${indicatorSize} rounded-full ring-2 ring-white ${
            isOnline ? 'bg-status-success' : 'bg-ink-muted'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

