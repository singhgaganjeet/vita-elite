'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
}

export default function StarRating({ rating, maxStars = 5, size = 14 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
            <Star
              size={size}
              style={{ color: '#2E2E2E', fill: '#2E2E2E', position: 'absolute', top: 0, left: 0 }}
            />
            {(filled || partial) && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  overflow: 'hidden',
                  width: partial ? `${(rating % 1) * 100}%` : '100%',
                }}
              >
                <Star size={size} style={{ color: '#F5C518', fill: '#F5C518' }} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
