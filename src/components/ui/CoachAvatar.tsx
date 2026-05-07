'use client';

import { CoachCategory } from '@/data/coaches';

interface CoachAvatarProps {
  name: string;
  category: CoachCategory;
  size?: number;
  className?: string;
}

const categoryColors: Record<CoachCategory, { bg: string; text: string }> = {
  fitness: { bg: 'rgba(34,197,94,0.18)', text: '#22C55E' },
  diet: { bg: 'rgba(245,197,24,0.18)', text: '#F5C518' },
  physio: { bg: 'rgba(59,130,246,0.18)', text: '#3B82F6' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function CoachAvatar({ name, category, size = 48, className = '' }: CoachAvatarProps) {
  const colors = categoryColors[category];
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors.bg,
        border: `2px solid ${colors.text}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.35,
        fontWeight: 700,
        color: colors.text,
        flexShrink: 0,
        letterSpacing: '0.02em',
      }}
    >
      {getInitials(name)}
    </div>
  );
}
