'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calendar, Users, TrendingUp, User, LogOut, Dumbbell } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

const navItems = [
  { href: '/coach/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/coach/bookings',  label: 'Bookings',   icon: Calendar },
  { href: '/coach/clients',   label: 'Clients',    icon: Users },
  { href: '/coach/earnings',  label: 'Earnings',   icon: TrendingUp },
  { href: '/coach/profile',   label: 'My Profile', icon: User },
];

export default function CoachSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { name, email, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <aside style={{ width: 240, minHeight: '100vh', background: '#0F1923', borderRight: '1px solid #1E2A38', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40 }} className="hidden lg:flex">
      <div style={{ padding: '28px 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={17} color="#3B82F6" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#FFFFFF' }}>VITA</span><span style={{ color: '#3B82F6' }}>ELITE</span>
          </span>
        </div>
        <span style={{ fontSize: 10, color: '#3B82F6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', paddingLeft: 2 }}>Coach Portal</span>
      </div>

      <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, textDecoration: 'none', background: active ? 'rgba(59,130,246,0.1)' : 'transparent', borderLeft: `3px solid ${active ? '#3B82F6' : 'transparent'}`, color: active ? '#3B82F6' : '#7A8FA6', fontWeight: active ? 600 : 400, fontSize: 14, transition: 'all 0.15s' }}>
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '14px 12px', borderTop: '1px solid #1E2A38' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#3B82F6', fontSize: 13, flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <div style={{ fontSize: 11, color: '#7A8FA6' }}>{email}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: 13, fontWeight: 500 }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
