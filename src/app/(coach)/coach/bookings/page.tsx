'use client';

import { useState, useEffect } from 'react';
import { Video, MapPin, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { useCoachPortalStore, type BookingStatus } from '@/stores/useCoachPortalStore';

const STATUS_COLORS: Record<BookingStatus, { color: string; bg: string }> = {
  pending:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  confirmed: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  completed: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
  cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
};

type FilterTab = 'all' | BookingStatus;

export default function CoachBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('all');
  const { bookings, updateBookingStatus } = useCoachPortalStore();
  useEffect(() => { setMounted(true); }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const counts = { all: bookings.length, pending: bookings.filter(b => b.status === 'pending').length, confirmed: bookings.filter(b => b.status === 'confirmed').length, completed: bookings.filter(b => b.status === 'completed').length, cancelled: bookings.filter(b => b.status === 'cancelled').length };

  if (!mounted) return <div style={{ padding: 24 }} />;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 860 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Bookings</h1>
      <p style={{ fontSize: 13, color: '#7A8FA6', marginBottom: 24 }}>Manage all your client session requests</p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as FilterTab[]).map(tab => (
          <button key={tab} onClick={() => setFilter(tab)} style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${filter === tab ? '#3B82F6' : '#1E2A38'}`, background: filter === tab ? 'rgba(59,130,246,0.12)' : 'transparent', color: filter === tab ? '#3B82F6' : '#7A8FA6', fontSize: 13, fontWeight: filter === tab ? 700 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>
            {tab} {tab !== 'all' ? `(${counts[tab as BookingStatus]})` : `(${counts.all})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && <p style={{ color: '#7A8FA6', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>No bookings found</p>}
        {filtered.map(b => {
          const sc = STATUS_COLORS[b.status];
          return (
            <div key={b.id} style={{ background: '#0F1923', border: '1px solid #1E2A38', borderRadius: 16, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#3B82F6', flexShrink: 0 }}>
                  {b.clientAvatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{b.clientName}</span>
                    <span style={{ fontSize: 11, color: sc.color, background: sc.bg, borderRadius: 20, padding: '2px 10px', fontWeight: 700, textTransform: 'capitalize' }}>{b.status}</span>
                    <span style={{ fontSize: 11, color: '#7A8FA6' }}>Session #{b.sessionNumber}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={12} color="#7A8FA6" />
                      <span style={{ fontSize: 12, color: '#7A8FA6' }}>{b.date} · {b.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {b.type === 'video' ? <Video size={12} color="#3B82F6" /> : <MapPin size={12} color="#22C55E" />}
                      <span style={{ fontSize: 12, color: '#7A8FA6', textTransform: 'capitalize' }}>{b.type}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>₹{b.amount.toLocaleString()}</span>
                  </div>
                  {b.notes && <p style={{ fontSize: 12, color: '#7A8FA6', marginTop: 6, fontStyle: 'italic' }}>{b.notes}</p>}
                </div>
              </div>

              {/* Action buttons */}
              {b.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid #1E2A38' }}>
                  <button onClick={() => updateBookingStatus(b.id, 'confirmed')} style={{ flex: 1, padding: '9px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, color: '#22C55E', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <CheckCircle size={14} /> Accept
                  </button>
                  <button onClick={() => updateBookingStatus(b.id, 'cancelled')} style={{ flex: 1, padding: '9px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#EF4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <XCircle size={14} /> Decline
                  </button>
                </div>
              )}
              {b.status === 'confirmed' && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1E2A38' }}>
                  <button onClick={() => updateBookingStatus(b.id, 'completed')} style={{ padding: '9px 20px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10, color: '#3B82F6', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
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
