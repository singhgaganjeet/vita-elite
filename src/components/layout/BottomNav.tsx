'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Apple, Users, Wrench, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/nutrition', label: 'Nutrition', icon: Apple },
  { href: '/coaches', label: 'Coaches', icon: Users },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#1A1A1A',
        borderTop: '1px solid #2E2E2E',
        display: 'flex',
        zIndex: 50,
      }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0',
              textDecoration: 'none',
              color: active ? '#22C55E' : '#A0A0A0',
              gap: 4,
              transition: 'color 0.15s',
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
