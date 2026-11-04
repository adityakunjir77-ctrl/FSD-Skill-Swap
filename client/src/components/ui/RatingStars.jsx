import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({
  rating = 0,
  max = 5,
  size = 'sm',
  interactive = false,
  onChange,
  showScore = false,
  count,
  className = '',
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size] || 'w-4 h-4';

  const activeValue = hoverRating || rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const starNumber = i + 1;
          const isFilled = starNumber <= activeValue;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starNumber)}
              onMouseEnter={() => interactive && setHoverRating(starNumber)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${
                interactive
                  ? 'cursor-pointer transition-transform hover:scale-110 focus:outline-none'
                  : 'cursor-default pointer-events-none'
              } p-0.5`}
              aria-label={`${starNumber} out of ${max} stars`}
            >
              <Star
                className={`${starSizes} transition-colors ${
                  isFilled
                    ? 'text-[#F59E0B] fill-[#F59E0B]'
                    : 'text-canvas-border-dark fill-transparent'
                }`}
                strokeWidth={1.75}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="font-heading font-semibold text-xs text-ink-primary">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className="text-xs text-ink-muted">
          ({count})
        </span>
      )}
    </div>
  );
}

