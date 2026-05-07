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

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>All Bookings</h1>
      <p style={{ fontSize: 13, color: '#8A7FA6', marginBottom: 20 }}>Platform-wide session bookings</p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',     value: bookings.length,                                        color: '#FFFFFF', bg: '#100E1A' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length,  color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length,  color: '#22C55E', bg: 'rgba(34,197,94,0.08)'  },
          { label: 'Revenue',   value: `₹${(totalRevenue/1000).toFixed(0)}k`,                  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: '1px solid #1E1A2E', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#8A7FA6', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bookings.map(b => (
          <div key={b.id} style={{ background: '#100E1A', border: '1px solid #1E1A2E', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#3B82F6', flexShrink: 0 }}>
              {b.clientAvatar}
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{b.clientName}</p>
              <p style={{ fontSize: 11, color: '#8A7FA6' }}>Coach: {coachName} · {b.date} {b.time}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {b.type === 'video' ? <Video size={12} color="#3B82F6" /> : <MapPin size={12} color="#22C55E" />}
              <span style={{ fontSize: 11, color: '#8A7FA6', textTransform: 'capitalize' }}>{b.type}</span>
            </div>
            <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>₹{b.amount.toLocaleString()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: b.status === 'completed' ? 'rgba(34,197,94,0.08)' : b.status === 'confirmed' ? 'rgba(59,130,246,0.08)' : b.status === 'pending' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 20, padding: '3px 10px' }}>
              {b.status === 'completed' && <CheckCircle size={11} color="#22C55E" />}
              {b.status === 'confirmed' && <Clock size={11} color="#3B82F6" />}
              {b.status === 'pending'   && <Clock size={11} color="#F59E0B" />}
              {b.status === 'cancelled' && <XCircle size={11} color="#EF4444" />}
              <span style={{ fontSize: 11, fontWeight: 700, color: b.status === 'completed' ? '#22C55E' : b.status === 'confirmed' ? '#3B82F6' : b.status === 'pending' ? '#F59E0B' : '#EF4444', textTransform: 'capitalize' }}>{b.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
