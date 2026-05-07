'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, IndianRupee, Calendar, CheckCircle } from 'lucide-react';
import { useCoachPortalStore, REVENUE_DATA } from '@/stores/useCoachPortalStore';

export default function CoachEarningsPage() {
  const [mounted, setMounted] = useState(false);
  const { bookings } = useCoachPortalStore();
  useEffect(() => { setMounted(true); }, []);

  const completed = bookings.filter(b => b.status === 'completed');
  const totalEarned = completed.reduce((s, b) => s + b.amount, 0);
  const thisMonth = REVENUE_DATA[REVENUE_DATA.length - 1];
  const lastMonth = REVENUE_DATA[REVENUE_DATA.length - 2];
  const growth = Math.round(((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100);
  const maxRevenue = Math.max(...REVENUE_DATA.map(r => r.revenue));

  if (!mounted) return <div style={{ padding: 24 }} />;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Earnings</h1>
      <p style={{ fontSize: 13, color: '#7A8FA6', marginBottom: 24 }}>Your revenue overview</p>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Earned',     value: `₹${(totalEarned/1000).toFixed(0)}k`, icon: IndianRupee, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
          { label: 'This Month',       value: `₹${(thisMonth.revenue/1000).toFixed(0)}k`, icon: TrendingUp, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Sessions Done',    value: completed.length, icon: CheckCircle, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: '#0F1923', border: '1px solid #1E2A38', borderRadius: 16, padding: '18px 16px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={17} color={s.color} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#7A8FA6' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue bar chart */}
      <div style={{ background: '#0F1923', border: '1px solid #1E2A38', borderRadius: 18, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Monthly Revenue</span>
          <span style={{ fontSize: 12, color: growth >= 0 ? '#22C55E' : '#EF4444', fontWeight: 700 }}>
            {growth >= 0 ? '+' : ''}{growth}% vs last month
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
          {REVENUE_DATA.map((r, i) => {
            const height = Math.round((r.revenue / maxRevenue) * 120);
            const isLast = i === REVENUE_DATA.length - 1;
            return (
              <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: isLast ? '#3B82F6' : '#7A8FA6', fontWeight: isLast ? 700 : 400 }}>
                  ₹{(r.revenue / 1000).toFixed(0)}k
                </span>
                <div style={{ width: '100%', height, borderRadius: '6px 6px 0 0', background: isLast ? '#3B82F6' : '#1E2A38', transition: 'height 0.3s', position: 'relative' }}>
                  {isLast && <div style={{ position: 'absolute', inset: 0, borderRadius: '6px 6px 0 0', background: 'linear-gradient(to top, #3B82F6, #60A5FA)', opacity: 0.9 }} />}
                </div>
                <span style={{ fontSize: 11, color: isLast ? '#3B82F6' : '#7A8FA6', fontWeight: isLast ? 700 : 400 }}>{r.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ background: '#0F1923', border: '1px solid #1E2A38', borderRadius: 18, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Calendar size={14} color="#3B82F6" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Recent Transactions</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {completed.slice(-6).reverse().map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#141E2B', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#3B82F6' }}>
                  {b.clientAvatar}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{b.clientName}</p>
                  <p style={{ fontSize: 11, color: '#7A8FA6' }}>{b.date} · Session #{b.sessionNumber}</p>
                </div>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#22C55E' }}>+₹{b.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
