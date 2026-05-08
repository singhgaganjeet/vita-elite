'use client';

import { useEffect, useState } from 'react';
import { Video, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useCoachPortalStore } from '@/stores/useCoachPortalStore';
import { coaches } from '@/data/coaches';

export default function AdminBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const { bookings } = useCoachPortalStore();
  useEffect(() => { setMounted(true); }, []);

  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.amount, 0);
  const coachName = coaches[0].name;

  if (!mounted) return <div style={{ padding: 24 }} />;

  const summaryCards = [
    { label: 'Total',     value: bookings.length,                                        color: 'var(--ve-text)',    bg: 'var(--ve-surface)'           },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length,  color: 'var(--ve-violet)', bg: 'rgba(139,92,246,0.06)'        },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length,  color: 'var(--ve-success)', bg: 'rgba(16,185,129,0.06)'       },
    { label: 'Revenue',   value: `₹${(totalRevenue/1000).toFixed(0)}k`,                  color: 'var(--ve-purple)', bg: 'rgba(124,58,237,0.06)'        },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'var(--ve-success)', bg: 'rgba(16,185,129,0.08)',  icon: CheckCircle };
      case 'confirmed': return { color: 'var(--ve-violet)',  bg: 'rgba(139,92,246,0.08)', icon: Clock       };
      case 'pending':   return { color: '#D97706',           bg: 'rgba(245,158,11,0.08)',  icon: Clock       };
      case 'cancelled': return { color: '#EF4444',           bg: 'rgba(239,68,68,0.08)',   icon: XCircle     };
      default:          return { color: 'var(--ve-text-3)',  bg: 'var(--ve-surface-2)',    icon: Clock       };
    }
  };

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, background: 'var(--ve-bg)', minHeight: '100%' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>All Bookings</h1>
      <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 20 }}>Platform-wide session bookings</p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid var(--ve-border)', borderRadius: 12, padding: '14px 16px', textAlign: 'center', boxShadow: 'var(--ve-shadow-sm)' }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--ve-text-3)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bookings list */}
      <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--ve-shadow-sm)' }}>
        {bookings.map((b, i) => {
          const st = getStatusStyle(b.status);
          const StatusIcon = st.icon;
          return (
            <div
              key={b.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                borderBottom: i < bookings.length - 1 ? '1px solid var(--ve-border)' : 'none',
                flexWrap: 'wrap',
                background: i % 2 === 0 ? '#FFFFFF' : '#FAFBFF',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--ve-purple)', flexShrink: 0 }}>
                {b.clientAvatar}
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)' }}>{b.clientName}</p>
                <p style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>Coach: {coachName} · {b.date} {b.time}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {b.type === 'video'
                  ? <Video size={12} color="var(--ve-violet)" />
                  : <MapPin size={12} color="var(--ve-success)" />}
                <span style={{ fontSize: 11, color: 'var(--ve-text-3)', textTransform: 'capitalize' }}>{b.type}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--ve-success)', fontWeight: 600 }}>₹{b.amount.toLocaleString()}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: st.bg, borderRadius: 20, padding: '3px 10px' }}>
                <StatusIcon size={11} color={st.color} />
                <span style={{ fontSize: 11, fontWeight: 700, color: st.color, textTransform: 'capitalize' }}>{b.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
