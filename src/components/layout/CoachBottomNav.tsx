'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, TrendingUp, User } from 'lucide-react';

const navItems = [
  { href: '/coach/dashboard', label: 'Home',     icon: LayoutDashboard },
  { href: '/coach/bookings',  label: 'Bookings', icon: Calendar },
  { href: '/coach/clients',   label: 'Clients',  icon: Users },
  { href: '/coach/earnings',  label: 'Earnings', icon: TrendingUp },
  { href: '/coach/profile',   label: 'Profile',  icon: User },
];

export default function CoachBottomNav() {
  const pathname = usePathname();

  return (
    <>
      <div className="block lg:hidden" style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />

      <nav
        className="flex lg:hidden"
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          background: '#FFFFFF',
          borderTop: '1px solid var(--ve-border)',
          alignItems: 'flex-start',
          zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -4px 20px rgba(124,58,237,0.08)',
        }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1, height: 64,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
                color: active ? 'var(--ve-purple)' : 'var(--ve-text-3)',
                gap: 4, transition: 'color 0.15s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, letterSpacing: '0.2px' }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
