'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, TrendingUp, TrendingDown, Calendar, Mail } from 'lucide-react';
import { useCoachPortalStore } from '@/stores/useCoachPortalStore';

export default function CoachClientsPage() {
  const [mounted, setMounted] = useState(false);
  const { clients, bookings } = useCoachPortalStore();
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div style={{ padding: 24 }} />;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 860 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>Clients</h1>
      <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 24 }}>{clients.length} active clients</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {clients.map(c => {
          const clientBookings = bookings.filter(b => b.clientEmail === c.email && b.status === 'completed');

          const progressColor =
            c.progress === 'ahead'    ? 'var(--ve-success)' :
            c.progress === 'behind'   ? 'var(--ve-danger)'  :
                                        'var(--ve-purple)';
          const progressBg =
            c.progress === 'ahead'    ? 'rgba(16,185,129,0.08)'  :
            c.progress === 'behind'   ? 'rgba(239,68,68,0.08)'   :
                                        'rgba(124,58,237,0.08)';
          const progressBarColor =
            c.progress === 'ahead'    ? 'var(--ve-success)' :
            c.progress === 'behind'   ? 'var(--ve-danger)'  :
                                        'var(--ve-gradient)';

          const ProgressIcon =
            c.progress === 'ahead'  ? TrendingUp  :
            c.progress === 'behind' ? TrendingDown : CheckCircle;

          const weightProgress = Math.round(Math.abs(c.weight - c.targetWeight));
          const totalChange = Math.abs(68 - c.targetWeight);
          const progressPct = totalChange > 0
            ? Math.min(100, Math.round(((c.weight > c.targetWeight ? (68 - c.weight) : (c.weight - 68)) / totalChange) * 100 + 50))
            : 50;

          return (
            <div key={c.id} style={{
              background: 'var(--ve-surface)',
              border: '1px solid var(--ve-border)',
              borderRadius: 18, padding: '18px 20px',
              boxShadow: 'var(--ve-shadow-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: 'var(--ve-success)', flexShrink: 0,
                }}>
                  {c.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ve-text)' }}>{c.name}</span>
                    <span style={{
                      fontSize: 11, color: progressColor, background: progressBg,
                      borderRadius: 20, padding: '2px 10px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <ProgressIcon size={11} />{c.progress}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Mail size={11} color="var(--ve-text-3)" />
                      <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{c.email}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>
                      Goal: <span style={{ color: 'var(--ve-text)', fontWeight: 600 }}>{c.goal}</span>
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{c.sessionsCompleted} sessions completed</span>
                  </div>
                </div>
                {c.nextSession && (
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: 'var(--ve-text-3)', marginBottom: 2 }}>Next session</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} color="var(--ve-purple)" />
                      <span style={{ fontSize: 12, color: 'var(--ve-purple)', fontWeight: 600 }}>{c.nextSession}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight progress bar */}
              <div style={{
                background: 'var(--ve-surface-2)',
                border: '1px solid var(--ve-border)',
                borderRadius: 12, padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>Weight goal progress</span>
                  <span style={{ fontSize: 12, color: 'var(--ve-text)', fontWeight: 600 }}>
                    {c.weight} kg → {c.targetWeight} kg ({weightProgress} kg to go)
                  </span>
                </div>
                <div style={{ background: 'var(--ve-border)', borderRadius: 99, height: 6 }}>
                  <div style={{
                    height: 6, borderRadius: 99,
                    background: c.progress === 'on-track' ? 'var(--ve-gradient)' : progressBarColor,
                    width: `${Math.max(5, progressPct)}%`,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>

              {clientBookings.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 11, color: 'var(--ve-text-3)', marginBottom: 6 }}>Recent sessions</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {clientBookings.slice(-3).map(b => (
                      <span key={b.id} style={{
                        fontSize: 11, color: 'var(--ve-text-2)',
                        background: 'var(--ve-surface-2)',
                        border: '1px solid var(--ve-border)',
                        borderRadius: 8, padding: '3px 10px',
                      }}>
                        {b.date} — {b.notes}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
