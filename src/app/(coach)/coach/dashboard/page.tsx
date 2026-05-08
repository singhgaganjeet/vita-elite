'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Star, TrendingUp, Clock, Video, MapPin, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCoachPortalStore } from '@/stores/useCoachPortalStore';
import { coaches } from '@/data/coaches';

export default function CoachDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { bookings, clients } = useCoachPortalStore();
  useEffect(() => { setMounted(true); }, []);

  const coach = coaches[0]; // Arjun Mehta

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').slice(0, 5);
  const completed = bookings.filter(b => b.status === 'completed').length;
  const thisMonthRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.amount, 0);
  const pending = bookings.filter(b => b.status === 'pending').length;

  const stats = [
    { label: 'Total Clients',    value: clients.length,                                  icon: Users,       color: 'var(--ve-violet)',  bg: 'rgba(124,58,237,0.08)'  },
    { label: 'Sessions Done',    value: completed,                                        icon: CheckCircle, color: 'var(--ve-success)', bg: 'rgba(16,185,129,0.08)'  },
    { label: 'Pending Requests', value: pending,                                          icon: Clock,       color: 'var(--ve-warning)', bg: 'rgba(245,158,11,0.08)'  },
    { label: 'Revenue (₹)',      value: `₹${(thisMonthRevenue / 1000).toFixed(0)}k`,     icon: TrendingUp,  color: 'var(--ve-pink)',    bg: 'rgba(236,72,153,0.08)'  },
  ];

  if (!mounted) return (
    <div style={{ padding: 24 }}>
      <div style={{ height: 200, background: 'var(--ve-surface-2)', borderRadius: 16 }} />
    </div>
  );

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 4 }}>Good morning,</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ve-text)', letterSpacing: '-0.5px' }}>{coach.name} 👋</h1>
          <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginTop: 2 }}>{coach.designation}</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 20, padding: '6px 14px'
        }}>
          <Star size={13} color="var(--ve-success)" fill="var(--ve-success)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ve-success)' }}>{coach.rating}</span>
          <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>· {coach.sessions} sessions</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 28 }} className="sm:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const isRevenue = i === 3;
          return (
            <div key={s.label} style={{
              background: 'var(--ve-surface)',
              border: '1px solid var(--ve-border)',
              borderRadius: 16,
              padding: '18px 16px',
              boxShadow: 'var(--ve-shadow-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={17} color={s.color} />
                </div>
              </div>
              <p style={{
                fontSize: 24, fontWeight: 900, lineHeight: 1, marginBottom: 4,
                ...(isRevenue ? {
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming sessions */}
        <div style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 18, padding: 20,
          boxShadow: 'var(--ve-shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={15} color="var(--ve-purple)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)' }}>Upcoming Sessions</span>
            </div>
            <Link href="/coach/bookings" style={{ fontSize: 12, color: 'var(--ve-purple)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600 }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--ve-text-3)', textAlign: 'center', padding: '20px 0' }}>No upcoming sessions</p>
            )}
            {upcoming.map(b => (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: 'var(--ve-surface-2)',
                borderRadius: 12,
                border: '1px solid var(--ve-border)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(124,58,237,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: 'var(--ve-purple)', flexShrink: 0,
                }}>
                  {b.clientAvatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.clientName}</p>
                  <p style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>{b.date} · {b.time}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  {b.type === 'video'
                    ? <Video size={12} color="var(--ve-purple)" />
                    : <MapPin size={12} color="var(--ve-success)" />}
                  <span style={{
                    fontSize: 10,
                    color: b.status === 'pending' ? 'var(--ve-warning)' : 'var(--ve-success)',
                    background: b.status === 'pending' ? 'rgba(245,158,11,0.10)' : 'rgba(16,185,129,0.10)',
                    borderRadius: 6, padding: '2px 7px', fontWeight: 600, textTransform: 'capitalize',
                  }}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client overview */}
        <div style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 18, padding: 20,
          boxShadow: 'var(--ve-shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={15} color="var(--ve-success)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)' }}>Active Clients</span>
            </div>
            <Link href="/coach/clients" style={{ fontSize: 12, color: 'var(--ve-purple)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600 }}>
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {clients.slice(0, 5).map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: 'var(--ve-surface-2)',
                borderRadius: 12,
                border: '1px solid var(--ve-border)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: 'var(--ve-success)', flexShrink: 0,
                }}>
                  {c.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>{c.goal} · {c.sessionsCompleted} sessions</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {c.progress === 'ahead'    && <AlertCircle size={13} color="var(--ve-success)" />}
                  {c.progress === 'behind'   && <AlertCircle size={13} color="var(--ve-danger)" />}
                  {c.progress === 'on-track' && <CheckCircle size={13} color="var(--ve-purple)" />}
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: c.progress === 'ahead' ? 'var(--ve-success)' : c.progress === 'behind' ? 'var(--ve-danger)' : 'var(--ve-purple)',
                  }}>{c.progress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
