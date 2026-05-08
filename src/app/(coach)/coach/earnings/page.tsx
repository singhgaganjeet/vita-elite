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
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>Earnings</h1>
      <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 24 }}>Your revenue overview</p>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Earned',  value: `₹${(totalEarned / 1000).toFixed(0)}k`,      icon: IndianRupee, gradient: true  },
          { label: 'This Month',    value: `₹${(thisMonth.revenue / 1000).toFixed(0)}k`, icon: TrendingUp,  gradient: true  },
          { label: 'Sessions Done', value: completed.length,                              icon: CheckCircle, gradient: false },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{
              background: 'var(--ve-surface)',
              border: '1px solid var(--ve-border)',
              borderRadius: 16, padding: '18px 16px',
              boxShadow: 'var(--ve-shadow-sm)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(124,58,237,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Icon size={17} color="var(--ve-purple)" />
              </div>
              <p style={{
                fontSize: 26, fontWeight: 900, lineHeight: 1, marginBottom: 4,
                ...(s.gradient ? {
                  background: 'var(--ve-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                } : { color: 'var(--ve-text)' }),
              }}>{s.value}</p>
              <p style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue bar chart */}
      <div style={{
        background: 'var(--ve-surface)',
        border: '1px solid var(--ve-border)',
        borderRadius: 18, padding: '20px 24px', marginBottom: 20,
        boxShadow: 'var(--ve-shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)' }}>Monthly Revenue</span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: growth >= 0 ? 'var(--ve-success)' : 'var(--ve-danger)',
            background: growth >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            borderRadius: 20, padding: '3px 10px',
          }}>
            {growth >= 0 ? '+' : ''}{growth}% vs last month
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
          {REVENUE_DATA.map((r, i) => {
            const height = Math.round((r.revenue / maxRevenue) * 120);
            const isLast = i === REVENUE_DATA.length - 1;
            return (
              <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 10,
                  color: isLast ? 'var(--ve-purple)' : 'var(--ve-text-3)',
                  fontWeight: isLast ? 700 : 400,
                }}>
                  ₹{(r.revenue / 1000).toFixed(0)}k
                </span>
                <div style={{
                  width: '100%', height, borderRadius: '6px 6px 0 0',
                  background: isLast ? 'var(--ve-gradient)' : 'var(--ve-surface-2)',
                  border: isLast ? 'none' : '1px solid var(--ve-border)',
                  transition: 'height 0.3s',
                  boxShadow: isLast ? 'var(--ve-shadow)' : 'none',
                }} />
                <span style={{
                  fontSize: 11,
                  color: isLast ? 'var(--ve-purple)' : 'var(--ve-text-3)',
                  fontWeight: isLast ? 700 : 400,
                }}>{r.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{
        background: 'var(--ve-surface)',
        border: '1px solid var(--ve-border)',
        borderRadius: 18, padding: '20px 24px',
        boxShadow: 'var(--ve-shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Calendar size={14} color="var(--ve-purple)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)' }}>Recent Transactions</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {completed.slice(-6).reverse().map(b => (
            <div key={b.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--ve-surface-2)',
              border: '1px solid var(--ve-border)',
              borderRadius: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(124,58,237,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'var(--ve-purple)',
                }}>
                  {b.clientAvatar}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)' }}>{b.clientName}</p>
                  <p style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>{b.date} · Session #{b.sessionNumber}</p>
                </div>
              </div>
              <span style={{
                fontSize: 15, fontWeight: 800,
                background: 'var(--ve-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>+₹{b.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
