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
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Clients</h1>
      <p style={{ fontSize: 13, color: '#7A8FA6', marginBottom: 24 }}>{clients.length} active clients</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {clients.map(c => {
          const clientBookings = bookings.filter(b => b.clientEmail === c.email && b.status === 'completed');
          const progressColor = c.progress === 'ahead' ? '#22C55E' : c.progress === 'behind' ? '#EF4444' : '#3B82F6';
          const progressBg = c.progress === 'ahead' ? 'rgba(34,197,94,0.1)' : c.progress === 'behind' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)';
          const ProgressIcon = c.progress === 'ahead' ? TrendingUp : c.progress === 'behind' ? TrendingDown : CheckCircle;

          const weightProgress = Math.round(Math.abs(c.weight - c.targetWeight));
          const totalChange = Math.abs(68 - c.targetWeight);
          const progressPct = totalChange > 0 ? Math.min(100, Math.round(((c.weight > c.targetWeight ? (68 - c.weight) : (c.weight - 68)) / totalChange) * 100 + 50)) : 50;

          return (
            <div key={c.id} style={{ background: '#0F1923', border: '1px solid #1E2A38', borderRadius: 18, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#22C55E', flexShrink: 0 }}>
                  {c.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: progressColor, background: progressBg, borderRadius: 20, padding: '2px 10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ProgressIcon size={11} />{c.progress}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Mail size={11} color="#7A8FA6" />
                      <span style={{ fontSize: 12, color: '#7A8FA6' }}>{c.email}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#7A8FA6' }}>Goal: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{c.goal}</span></span>
                    <span style={{ fontSize: 12, color: '#7A8FA6' }}>{c.sessionsCompleted} sessions completed</span>
                  </div>
                </div>
                {c.nextSession && (
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: '#7A8FA6', marginBottom: 2 }}>Next session</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={11} color="#3B82F6" />
                      <span style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>{c.nextSession}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight progress bar */}
              <div style={{ background: '#141E2B', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#7A8FA6' }}>Weight goal progress</span>
                  <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600 }}>{c.weight} kg → {c.targetWeight} kg ({weightProgress} kg to go)</span>
                </div>
                <div style={{ background: '#1E2A38', borderRadius: 99, height: 6 }}>
                  <div style={{ height: 6, borderRadius: 99, background: progressColor, width: `${Math.max(5, progressPct)}%`, transition: 'width 0.3s' }} />
                </div>
              </div>

              {clientBookings.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 11, color: '#7A8FA6', marginBottom: 6 }}>Recent sessions</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {clientBookings.slice(-3).map(b => (
                      <span key={b.id} style={{ fontSize: 11, color: '#7A8FA6', background: '#141E2B', borderRadius: 8, padding: '3px 10px' }}>{b.date} — {b.notes}</span>
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
