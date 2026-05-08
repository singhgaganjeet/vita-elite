'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, Calendar, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAdminStore, PLATFORM_GROWTH } from '@/stores/useAdminStore';

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { users, applications } = useAdminStore();
  useEffect(() => { setMounted(true); }, []);

  const latest = PLATFORM_GROWTH[PLATFORM_GROWTH.length - 1];
  const prev = PLATFORM_GROWTH[PLATFORM_GROWTH.length - 2];
  const userGrowth = Math.round(((latest.users - prev.users) / prev.users) * 100);
  const revenueGrowth = Math.round(((latest.revenue - prev.revenue) / prev.revenue) * 100);
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const maxRevenue = Math.max(...PLATFORM_GROWTH.map(r => r.revenue));

  const kpis = [
    { label: 'Total Users',         value: latest.users.toLocaleString(),                      sub: `+${userGrowth}% this month`,    icon: Users,      color: 'var(--ve-violet)', bg: 'rgba(139,92,246,0.08)'  },
    { label: 'Active Coaches',      value: latest.coaches,                                      sub: `${pendingApps} pending review`, icon: UserCheck,  color: 'var(--ve-success)', bg: 'rgba(16,185,129,0.08)'  },
    { label: 'Sessions This Month', value: latest.sessions.toLocaleString(),                    sub: `All-time: 8,432`,               icon: Calendar,   color: 'var(--ve-purple)', bg: 'rgba(124,58,237,0.08)'  },
    { label: 'Revenue (May)',        value: `₹${(latest.revenue/100000).toFixed(1)}L`,           sub: `+${revenueGrowth}% vs April`,   icon: TrendingUp, color: 'var(--ve-purple)', bg: 'rgba(124,58,237,0.08)'  },
  ];

  const recentUsers = users.slice(0, 5);

  if (!mounted) return <div style={{ padding: 24 }} />;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1000, background: 'var(--ve-bg)', minHeight: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ve-text)', letterSpacing: '-0.5px', marginBottom: 4 }}>Platform Overview</h1>
        <p style={{ fontSize: 13, color: 'var(--ve-text-3)' }}>Vita Elite · Super Admin Dashboard</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 28 }} className="lg:grid-cols-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 16, padding: '18px 16px', boxShadow: 'var(--ve-shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color={k.color} />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--ve-text)', lineHeight: 1, marginBottom: 4 }}>{k.value}</p>
              <p style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{k.label}</p>
              <p style={{ fontSize: 11, color: k.color, marginTop: 4, fontWeight: 600 }}>{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {pendingApps > 0 && (
        <Link href="/admin/coaches" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <AlertCircle size={18} color="#D97706" />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>{pendingApps} coach application{pendingApps > 1 ? 's' : ''} awaiting review</p>
              <p style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>Click to review and approve or reject →</p>
            </div>
          </div>
        </Link>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue bar chart */}
        <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 18, padding: '20px 24px', boxShadow: 'var(--ve-shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)' }}>Revenue (6 months)</span>
            <span style={{ fontSize: 11, color: 'var(--ve-success)', fontWeight: 700 }}>+{revenueGrowth}% MoM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {PLATFORM_GROWTH.map((r, i) => {
              const h = Math.round((r.revenue / maxRevenue) * 100);
              const isLast = i === PLATFORM_GROWTH.length - 1;
              return (
                <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: '100%', height: h, borderRadius: '5px 5px 0 0', background: isLast ? '#7C3AED' : 'var(--ve-border)', position: 'relative', overflow: 'hidden' }}>
                    {isLast && <div style={{ position: 'absolute', inset: 0, borderRadius: '5px 5px 0 0', background: 'var(--ve-gradient)', opacity: 0.9 }} />}
                  </div>
                  <span style={{ fontSize: 10, color: isLast ? 'var(--ve-purple)' : 'var(--ve-text-3)', fontWeight: isLast ? 700 : 400 }}>{r.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User growth */}
        <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 18, padding: '20px 24px', boxShadow: 'var(--ve-shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)' }}>User Growth</span>
            <span style={{ fontSize: 11, color: 'var(--ve-violet)', fontWeight: 700 }}>+{userGrowth}% MoM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {PLATFORM_GROWTH.map((r, i) => {
              const maxU = Math.max(...PLATFORM_GROWTH.map(x => x.users));
              const h = Math.round((r.users / maxU) * 100);
              const isLast = i === PLATFORM_GROWTH.length - 1;
              return (
                <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: '100%', height: h, borderRadius: '5px 5px 0 0', background: isLast ? '#8B5CF6' : 'var(--ve-border)', position: 'relative', overflow: 'hidden' }}>
                    {isLast && <div style={{ position: 'absolute', inset: 0, borderRadius: '5px 5px 0 0', background: 'linear-gradient(to top, #7C3AED, #8B5CF6)', opacity: 0.9 }} />}
                  </div>
                  <span style={{ fontSize: 10, color: isLast ? 'var(--ve-violet)' : 'var(--ve-text-3)', fontWeight: isLast ? 700 : 400 }}>{r.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 18, padding: '20px 24px', boxShadow: 'var(--ve-shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)' }}>Recent Users</span>
          <Link href="/admin/users" style={{ fontSize: 12, color: 'var(--ve-purple)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentUsers.map((u, idx) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: idx % 2 === 0 ? '#FFFFFF' : '#FAFBFF', borderRadius: 12, border: '1px solid var(--ve-border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--ve-purple)', flexShrink: 0 }}>
                {u.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                <p style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>{u.city} · {u.goal}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {u.status === 'active'
                  ? <CheckCircle size={12} color="var(--ve-success)" />
                  : <Clock size={12} color="#D97706" />}
                <span style={{ fontSize: 11, color: u.status === 'active' ? 'var(--ve-success)' : '#D97706', fontWeight: 600, textTransform: 'capitalize' }}>{u.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
