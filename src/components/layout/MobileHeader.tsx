'use client';

import Image from 'next/image';

export default function MobileHeader() {
  return (
    <header
      className="lg:hidden"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#FFFFFF',
        borderBottom: '1px solid var(--ve-border)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
      }}
    >
      <Image src="/logo.png" alt="Vita Elite" width={28} height={28} style={{ objectFit: 'contain' }} />
      <span
        style={{
          fontSize: 18,
          fontWeight: 700,
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Vita Elite
      </span>
    </header>
  );
}
