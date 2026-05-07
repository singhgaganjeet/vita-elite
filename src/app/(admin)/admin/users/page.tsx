'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Clock, ShieldOff, Shield } from 'lucide-react';
import { useAdminStore, type UserStatus } from '@/stores/useAdminStore';

const STATUS_CONFIG: Record<UserStatus, { color: string; bg: string; icon: typeof CheckCircle }> = {
  active:    { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  icon: CheckCircle },
  inactive:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Clock       },
  suspended: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  icon: XCircle     },
};

export default function AdminUsersPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const { users, updateUserStatus } = useAdminStore();
  useEffect(() => { setMounted(true); }, []);

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  }), [users, search, statusFilter]);

  if (!mounted) return <div style={{ padding: 24 }} />;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Users</h1>
        <p style={{ fontSize: 13, color: '#8A7FA6' }}>{users.length} total registered users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color="#8A7FA6" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input-field" placeholder="Search by name, email, city..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, background: '#100E1A', border: '1px solid #1E1A2E', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'active', 'inactive', 'suspended'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '8px 14px', borderRadius: 20, border: `1px solid ${statusFilter === s ? '#F59E0B' : '#1E1A2E'}`, background: statusFilter === s ? 'rgba(245,158,11,0.1)' : 'transparent', color: statusFilter === s ? '#F59E0B' : '#8A7FA6', fontSize: 12, fontWeight: statusFilter === s ? 700 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['active', 'inactive', 'suspended'] as UserStatus[]).map(s => {
          const cnt = users.filter(u => u.status === s).length;
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#100E1A', border: `1px solid #1E1A2E`, borderRadius: 12, padding: '8px 14px' }}>
              <Icon size={13} color={cfg.color} />
              <span style={{ fontSize: 12, color: cfg.color, fontWeight: 700 }}>{cnt} {s}</span>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: '#100E1A', border: '1px solid #1E1A2E', borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px 90px', padding: '12px 20px', borderBottom: '1px solid #1E1A2E' }}>
          {['User', 'City / Goal', 'Joined', 'Sessions', 'Actions'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#8A7FA6', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</span>
          ))}
        </div>
        {filtered.length === 0 && <p style={{ padding: '32px', textAlign: 'center', color: '#8A7FA6', fontSize: 14 }}>No users match your search</p>}
        {filtered.map((u, i) => {
          const sc = STATUS_CONFIG[u.status];
          const StatusIcon = sc.icon;
          return (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px 90px', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #1E1A2E' : 'none', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#3B82F6', flexShrink: 0 }}>
                  {u.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                  <p style={{ fontSize: 11, color: '#8A7FA6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#FFFFFF' }}>{u.city}</p>
                <p style={{ fontSize: 11, color: '#8A7FA6' }}>{u.goal}</p>
              </div>
              <p style={{ fontSize: 12, color: '#8A7FA6' }}>{u.joinedDate}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{u.sessionsBooked}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: sc.bg, borderRadius: 20, padding: '3px 8px' }}>
                  <StatusIcon size={11} color={sc.color} />
                  <span style={{ fontSize: 10, color: sc.color, fontWeight: 700, textTransform: 'capitalize' }}>{u.status}</span>
                </div>
                {u.status !== 'suspended' ? (
                  <button onClick={() => updateUserStatus(u.id, 'suspended')} title="Suspend" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 2 }}>
                    <ShieldOff size={14} />
                  </button>
                ) : (
                  <button onClick={() => updateUserStatus(u.id, 'active')} title="Reactivate" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22C55E', padding: 2 }}>
                    <Shield size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
