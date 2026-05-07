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

  return (
    <div style={{ padding: '28px 24px', maxWidth: 960 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Analytics</h1>
      <p style={{ fontSize: 13, color: '#8A7FA6', marginBottom: 28 }}>Platform performance metrics — last 6 months</p>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Revenue',       value: `₹${(totalRevenue/100000).toFixed(1)}L`, icon: IndianRupee, color: '#F59E0B' },
          { label: 'Total Users',          value: latest.users.toLocaleString(),           icon: Users,       color: '#3B82F6' },
          { label: 'Total Sessions',       value: totalSessions.toLocaleString(),           icon: Calendar,   color: '#22C55E' },
          { label: 'Avg Rev/Session',      value: `₹${Math.round(totalRevenue/totalSessions).toLocaleString()}`, icon: TrendingUp, color: '#8B5CF6' },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} style={{ background: '#100E1A', border: '1px solid #1E1A2E', borderRadius: 16, padding: '18px 16px' }}>
              <Icon size={20} color={k.color} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>{k.value}</p>
              <p style={{ fontSize: 12, color: '#8A7FA6' }}>{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue chart */}
        <div style={{ background: '#100E1A', border: '1px solid #1E1A2E', borderRadius: 18, padding: '20px 24px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 20 }}>Revenue (₹)</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {PLATFORM_GROWTH.map((r, i) => {
              const h = Math.round((r.revenue / maxRevenue) * 120);
              const isLast = i === PLATFORM_GROWTH.length - 1;
              return (
                <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#8A7FA6' }}>₹{(r.revenue/1000).toFixed(0)}k</span>
                  <div style={{ width: '100%', height: h, borderRadius: '5px 5px 0 0', background: isLast ? '#F59E0B' : '#1E1A2E' }} />
                  <span style={{ fontSize: 10, color: isLast ? '#F59E0B' : '#8A7FA6', fontWeight: isLast ? 700 : 400 }}>{r.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sessions chart */}
        <div style={{ background: '#100E1A', border: '1px solid #1E1A2E', borderRadius: 18, padding: '20px 24px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 20 }}>Sessions</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {PLATFORM_GROWTH.map((r, i) => {
              const h = Math.round((r.sessions / maxSessions) * 120);
              const isLast = i === PLATFORM_GROWTH.length - 1;
              return (
                <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#8A7FA6' }}>{r.sessions}</span>
                  <div style={{ width: '100%', height: h, borderRadius: '5px 5px 0 0', background: isLast ? '#22C55E' : '#1E1A2E' }} />
                  <span style={{ fontSize: 10, color: isLast ? '#22C55E' : '#8A7FA6', fontWeight: isLast ? 700 : 400 }}>{r.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User growth full-width */}
      <div style={{ background: '#100E1A', border: '1px solid #1E1A2E', borderRadius: 18, padding: '20px 24px', marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 20 }}>User Growth</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 140 }}>
          {PLATFORM_GROWTH.map((r, i) => {
            const h = Math.round((r.users / maxUsers) * 120);
            const isLast = i === PLATFORM_GROWTH.length - 1;
            return (
              <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#8A7FA6' }}>{r.users}</span>
                <div style={{ width: '100%', height: h, borderRadius: '5px 5px 0 0', background: isLast ? '#3B82F6' : '#1E1A2E' }} />
                <span style={{ fontSize: 11, color: isLast ? '#3B82F6' : '#8A7FA6', fontWeight: isLast ? 700 : 400 }}>{r.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coach revenue breakdown */}
      <div style={{ background: '#100E1A', border: '1px solid #1E1A2E', borderRadius: 18, padding: '20px 24px' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>Coach Revenue Breakdown (Top Coach — Arjun Mehta)</p>
        <div style={{ display: 'flex', gap: 14 }}>
          {REVENUE_DATA.map((r, i) => {
            const isLast = i === REVENUE_DATA.length - 1;
            return (
              <div key={r.month} style={{ flex: 1, background: '#16122A', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: isLast ? '#F59E0B' : '#FFFFFF' }}>₹{(r.revenue/1000).toFixed(0)}k</p>
                <p style={{ fontSize: 11, color: '#8A7FA6', marginTop: 2 }}>{r.month}</p>
                <p style={{ fontSize: 10, color: '#8A7FA6' }}>{r.sessions} sessions</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
