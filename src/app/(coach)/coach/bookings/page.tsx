'use client';

import { useState, useEffect } from 'react';
import { Video, MapPin, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { useCoachPortalStore, type BookingStatus } from '@/stores/useCoachPortalStore';

const STATUS_COLORS: Record<BookingStatus, { color: string; bg: string }> = {
  pending:   { color: 'var(--ve-warning)', bg: 'rgba(245,158,11,0.08)'   },
  confirmed: { color: 'var(--ve-purple)',  bg: 'rgba(124,58,237,0.08)'   },
  completed: { color: 'var(--ve-success)', bg: 'rgba(16,185,129,0.08)'   },
  cancelled: { color: 'var(--ve-danger)',  bg: 'rgba(239,68,68,0.08)'    },
};

type FilterTab = 'all' | BookingStatus;

export default function CoachBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('all');
  const { bookings, updateBookingStatus } = useCoachPortalStore();
  useEffect(() => { setMounted(true); }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (!mounted) return <div style={{ padding: 24 }} />;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 860 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>Bookings</h1>
      <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 24 }}>Manage all your client session requests</p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '7px 14px', borderRadius: 20,
              border: `1px solid ${filter === tab ? 'var(--ve-purple)' : 'var(--ve-border)'}`,
              background: filter === tab ? 'rgba(124,58,237,0.08)' : 'var(--ve-surface)',
              color: filter === tab ? 'var(--ve-purple)' : 'var(--ve-text-3)',
              fontSize: 13, fontWeight: filter === tab ? 700 : 400,
              cursor: 'pointer', textTransform: 'capitalize',
              boxShadow: filter === tab ? 'none' : 'var(--ve-shadow-sm)',
              transition: 'all 0.15s',
            }}
          >
            {tab} {tab !== 'all' ? `(${counts[tab as BookingStatus]})` : `(${counts.all})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && (
          <p style={{ color: 'var(--ve-text-3)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>No bookings found</p>
        )}
        {filtered.map(b => {
          const sc = STATUS_COLORS[b.status];
          return (
            <div key={b.id} style={{
              background: 'var(--ve-surface)',
              border: '1px solid var(--ve-border)',
              borderRadius: 16, padding: '16px 20px',
              boxShadow: 'var(--ve-shadow-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(124,58,237,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: 'var(--ve-purple)', flexShrink: 0,
                }}>
                  {b.clientAvatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ve-text)' }}>{b.clientName}</span>
                    <span style={{
                      fontSize: 11, color: sc.color, background: sc.bg,
                      borderRadius: 20, padding: '2px 10px', fontWeight: 700, textTransform: 'capitalize',
                    }}>{b.status}</span>
                    <span style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>Session #{b.sessionNumber}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={12} color="var(--ve-text-3)" />
                      <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{b.date} · {b.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {b.type === 'video'
                        ? <Video size={12} color="var(--ve-purple)" />
                        : <MapPin size={12} color="var(--ve-success)" />}
                      <span style={{ fontSize: 12, color: 'var(--ve-text-3)', textTransform: 'capitalize' }}>{b.type}</span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      background: 'var(--ve-gradient)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>₹{b.amount.toLocaleString()}</span>
                  </div>
                  {b.notes && (
                    <p style={{ fontSize: 12, color: 'var(--ve-text-3)', marginTop: 6, fontStyle: 'italic' }}>{b.notes}</p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {b.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ve-border)' }}>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'confirmed')}
                    style={{
                      flex: 1, padding: '9px',
                      background: 'var(--ve-gradient)',
                      border: 'none',
                      borderRadius: 10, color: '#FFFFFF',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: 'var(--ve-shadow-sm)',
                    }}
                  >
                    <CheckCircle size={14} /> Accept
                  </button>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'cancelled')}
                    style={{
                      flex: 1, padding: '9px',
                      background: 'rgba(239,68,68,0.06)',
                      border: '1px solid rgba(239,68,68,0.18)',
                      borderRadius: 10, color: 'var(--ve-danger)',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <XCircle size={14} /> Decline
                  </button>
                </div>
              )}
              {b.status === 'confirmed' && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ve-border)' }}>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'completed')}
                    style={{
                      padding: '9px 20px',
                      background: 'var(--ve-gradient)',
                      border: 'none',
                      borderRadius: 10, color: '#FFFFFF',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: 'var(--ve-shadow-sm)',
                    }}
                  >
                    <Clock size={14} /> Mark as Completed
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
