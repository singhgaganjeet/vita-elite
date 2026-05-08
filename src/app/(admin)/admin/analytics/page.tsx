'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Calendar, IndianRupee } from 'lucide-react';
import { PLATFORM_GROWTH } from '@/stores/useAdminStore';
import { REVENUE_DATA } from '@/stores/useCoachPortalStore';

export default function AdminAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const totalRevenue = PLATFORM_GROWTH.reduce((s, r) => s + r.revenue, 0);
  const totalSessions = PLATFORM_GROWTH.reduce((s, r) => s + r.sessions, 0);
  const latest = PLATFORM_GROWTH[PLATFORM_GROWTH.length - 1];

  if (!mounted) return <div style={{ padding: 24 }} />;

  const maxRevenue = Math.max(...PLATFORM_GROWTH.map(r => r.revenue));
  const maxUsers = Math.max(...PLATFORM_GROWTH.map(r => r.users));
  const maxSessions = Math.max(...PLATFORM_GROWTH.map(r => r.sessions));

  const kpis = [
    { label: 'Total Revenue',    value: `₹${(totalRevenue/100000).toFixed(1)}L`,                            icon: IndianRupee, color: 'var(--ve-purple)', bg: 'rgba(124,58,237,0.08)' },
    { label: 'Total Users',      value: latest.users.toLocaleString(),                                       icon: Users,       color: 'var(--ve-violet)', bg: 'rgba(139,92,246,0.08)' },
    { label: 'Total Sessions',   value: totalSessions.toLocaleString(),                                      icon: Calendar,    color: 'var(--ve-success)', bg: 'rgba(16,185,129,0.08)' },
    { label: 'Avg Rev/Session',  value: `₹${Math.round(totalRevenue / totalSessions).toLocaleString()}`,     icon: TrendingUp,  color: 'var(--ve-pink)',   bg: 'rgba(236,72,153,0.08)' },
  ];

  return (
    <div style={{ padding: '28px 24px', maxWidth: 960, background: 'var(--ve-bg)', minHeight: '100%' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>Analytics</h1>
      <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 28 }}>Platform performance metrics — last 6 months</p>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 16, padding: '18px 16px', boxShadow: 'var(--ve-shadow-sm)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={18} color={k.color} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--ve-text)', marginBottom: 4 }}>{k.value}</p>
              <p style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue chart */}
        <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 18, padding: '20px 24px', boxShadow: 'var(--ve-shadow-sm)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 20 }}>Revenue (₹)</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {PLATFORM_GROWTH.map((r, i) => {
              const h = Math.round((r.revenue / maxRevenue) * 120);
              const isLast = i === PLATFORM_GROWTH.length - 1;
              return (
                <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--ve-text-3)' }}>₹{(r.revenue / 1000).toFixed(0)}k</span>
                  <div style={{ width: '100%', height: h, borderRadius: '5px 5px 0 0', background: isLast ? '#7C3AED' : 'var(--ve-border)', position: 'relative', overflow: 'hidden' }}>
                    {isLast && <div style={{ position: 'absolute', inset: 0, background: 'var(--ve-gradient)' }} />}
                  </div>
                  <span style={{ fontSize: 10, color: isLast ? 'var(--ve-purple)' : 'var(--ve-text-3)', fontWeight: isLast ? 700 : 400 }}>{r.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sessions chart */}
        <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 18, padding: '20px 24px', boxShadow: 'var(--ve-shadow-sm)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 20 }}>Sessions</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {PLATFORM_GROWTH.map((r, i) => {
              const h = Math.round((r.sessions / maxSessions) * 120);
              const isLast = i === PLATFORM_GROWTH.length - 1;
              return (
                <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--ve-text-3)' }}>{r.sessions}</span>
                  <div style={{ width: '100%', height: h, borderRadius: '5px 5px 0 0', background: isLast ? 'var(--ve-success)' : 'var(--ve-border)' }} />
                  <span style={{ fontSize: 10, color: isLast ? 'var(--ve-success)' : 'var(--ve-text-3)', fontWeight: isLast ? 700 : 400 }}>{r.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User growth full-width */}
      <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 18, padding: '20px 24px', marginBottom: 20, boxShadow: 'var(--ve-shadow-sm)' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 20 }}>User Growth</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 140 }}>
          {PLATFORM_GROWTH.map((r, i) => {
            const h = Math.round((r.users / maxUsers) * 120);
            const isLast = i === PLATFORM_GROWTH.length - 1;
            return (
              <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--ve-text-3)' }}>{r.users}</span>
                <div style={{ width: '100%', height: h, borderRadius: '5px 5px 0 0', background: isLast ? '#8B5CF6' : 'var(--ve-border)', position: 'relative', overflow: 'hidden' }}>
                  {isLast && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #7C3AED, #8B5CF6)' }} />}
                </div>
                <span style={{ fontSize: 11, color: isLast ? 'var(--ve-violet)' : 'var(--ve-text-3)', fontWeight: isLast ? 700 : 400 }}>{r.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coach revenue breakdown */}
      <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 18, padding: '20px 24px', boxShadow: 'var(--ve-shadow-sm)' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 16 }}>Coach Revenue Breakdown (Top Coach — Arjun Mehta)</p>
        <div style={{ display: 'flex', gap: 14 }}>
          {REVENUE_DATA.map((r, i) => {
            const isLast = i === REVENUE_DATA.length - 1;
            return (
              <div
                key={r.month}
                style={{
                  flex: 1,
                  background: isLast ? 'rgba(124,58,237,0.06)' : 'var(--ve-surface-2)',
                  border: `1px solid ${isLast ? 'var(--ve-border)' : 'var(--ve-border)'}`,
                  borderRadius: 12,
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 800, color: isLast ? 'var(--ve-purple)' : 'var(--ve-text)' }}>
                  ₹{(r.revenue / 1000).toFixed(0)}k
                </p>
                <p style={{ fontSize: 11, color: 'var(--ve-text-3)', marginTop: 2 }}>{r.month}</p>
                <p style={{ fontSize: 10, color: 'var(--ve-text-3)' }}>{r.sessions} sessions</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
