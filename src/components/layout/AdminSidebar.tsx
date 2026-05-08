'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, Calendar, BarChart3, LogOut, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users',     label: 'Users',      icon: Users },
  { href: '/admin/coaches',   label: 'Coaches',    icon: UserCheck },
  { href: '/admin/bookings',  label: 'Bookings',   icon: Calendar },
  { href: '/admin/analytics', label: 'Analytics',  icon: BarChart3 },
];

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { name, email, logout } = useAuthStore();

  const handleLogout = async () => { await logout(); router.push('/login'); };

  return (
    <aside
      style={{
        width: 240,
        minHeight: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid var(--ve-border)',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 40,
        boxShadow: '4px 0 24px rgba(124,58,237,0.06)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}
      className="hidden lg:flex"
    >
      {/* Logo + toggle */}
      <div style={{ padding: '24px 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/logo.png" alt="Vita Elite" width={36} height={36} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '-0.5px', lineHeight: 1 }}>
              <span style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Vita Elite
              </span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--ve-text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 1 }}>
              Super Admin
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          title="Collapse sidebar"
          style={{
            width: 28, height: 28, borderRadius: 8, border: '1px solid var(--ve-border)',
            background: 'transparent', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--ve-text-3)',
            flexShrink: 0, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--ve-surface-2)'; e.currentTarget.style.color = 'var(--ve-purple)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ve-text-3)'; }}
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      <div style={{ height: 1, background: 'var(--ve-border)', margin: '0 16px' }} />

      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                background: active ? 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.08))' : 'transparent',
                borderLeft: `2px solid ${active ? 'var(--ve-purple)' : 'transparent'}`,
                color: active ? 'var(--ve-purple)' : 'var(--ve-text-2)',
                fontWeight: active ? 600 : 400, fontSize: 14, transition: 'all 0.15s',
              }}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ height: 1, background: 'var(--ve-border)', margin: '0 16px' }} />

      <div style={{ padding: '14px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', marginBottom: 4 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: '#FFFFFF', fontSize: 13, flexShrink: 0,
          }}>
            {(name || 'A').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <div style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>{email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 14px', borderRadius: 10, border: 'none',
            background: 'transparent', color: 'var(--ve-danger)', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
