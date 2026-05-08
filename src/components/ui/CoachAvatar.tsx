'use client';

import { CoachCategory } from '@/data/coaches';

interface CoachAvatarProps {
  name: string;
  category: CoachCategory;
  size?: number;
  className?: string;
}

const categoryColors: Record<CoachCategory, { bg: string; text: string; border: string }> = {
  fitness: { bg: 'rgba(124,58,237,0.10)',  text: '#7C3AED', border: 'rgba(124,58,237,0.25)' },
  diet:    { bg: 'rgba(168,85,247,0.10)',  text: '#A855F7', border: 'rgba(168,85,247,0.25)' },
  physio:  { bg: 'rgba(236,72,153,0.10)',  text: '#EC4899', border: 'rgba(236,72,153,0.25)' },
};

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function CoachAvatar({ name, category, size = 48, className = '' }: CoachAvatarProps) {
  const colors = categoryColors[category];
  return (
    <div
      className={className}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 700, color: colors.text,
        flexShrink: 0, letterSpacing: '0.02em',
      }}
    >
      {getInitials(name)}
    </div>
  );
}
