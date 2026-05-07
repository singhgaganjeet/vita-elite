'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Apple, Users, Wrench, User, Dumbbell } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/nutrition', label: 'Nutrition', icon: Apple },
  { href: '/coaches', label: 'Coaches', icon: Users },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        minHeight: '100vh',
        background: '#1A1A1A',
        borderRight: '1px solid #2E2E2E',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 40,
      }}
      className="hidden lg:flex"
    >
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(34,197,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Dumbbell size={18} color="#22C55E" />
          </div>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              VITA
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#22C55E', letterSpacing: '-0.5px' }}>
              ELITE
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                textDecoration: 'none',
                background: active ? 'rgba(34,197,94,0.1)' : 'transparent',
                borderLeft: active ? '3px solid #22C55E' : '3px solid transparent',
                color: active ? '#22C55E' : '#A0A0A0',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User avatar */}
      <div
        style={{
          padding: '20px 24px',
          borderTop: '1px solid #2E2E2E',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#22C55E',
            fontSize: 14,
          }}
        >
          P
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>Priya</div>
          <div style={{ fontSize: 11, color: '#A0A0A0' }}>Free Plan</div>
        </div>
      </div>
    </aside>
  );
}
