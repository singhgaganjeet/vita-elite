'use client';

import { Dumbbell } from 'lucide-react';

export default function MobileHeader() {
  return (
    <header
      className="lg:hidden"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#0A0A0A',
        borderBottom: '1px solid #2E2E2E',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: 'rgba(34,197,94,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Dumbbell size={16} color="#22C55E" />
      </div>
      <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.5px' }}>
        <span style={{ color: '#FFFFFF' }}>VITA</span>
        <span style={{ color: '#22C55E' }}>ELITE</span>
      </span>
    </header>
  );
}
