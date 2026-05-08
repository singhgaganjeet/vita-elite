'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Clock, ShieldOff, Shield } from 'lucide-react';
import { useAdminStore, type UserStatus } from '@/stores/useAdminStore';

const STATUS_CONFIG: Record<UserStatus, { color: string; bg: string; icon: typeof CheckCircle }> = {
  active:    { color: 'var(--ve-success)',  bg: 'rgba(16,185,129,0.08)',  icon: CheckCircle },
  inactive:  { color: '#D97706',            bg: 'rgba(245,158,11,0.08)',  icon: Clock       },
  suspended: { color: 'var(--ve-danger)',   bg: 'rgba(239,68,68,0.08)',   icon: XCircle     },
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
    <div style={{ padding: '28px 24px', maxWidth: 1000, background: 'var(--ve-bg)', minHeight: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>Users</h1>
        <p style={{ fontSize: 13, color: 'var(--ve-text-3)' }}>{users.length} total registered users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--ve-text-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input-field"
            placeholder="Search by name, email, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              paddingLeft: 36,
              background: 'var(--ve-surface)',
              border: '1px solid var(--ve-border)',
              color: 'var(--ve-text)',
              width: '100%',
              borderRadius: 10,
              padding: '9px 12px 9px 36px',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'active', 'inactive', 'suspended'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: `1px solid ${statusFilter === s ? 'var(--ve-purple)' : 'var(--ve-border)'}`,
                background: statusFilter === s ? 'rgba(124,58,237,0.08)' : 'var(--ve-surface)',
                color: statusFilter === s ? 'var(--ve-purple)' : 'var(--ve-text-3)',
                fontSize: 12,
                fontWeight: statusFilter === s ? 700 : 400,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary badges */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['active', 'inactive', 'suspended'] as UserStatus[]).map(s => {
          const cnt = users.filter(u => u.status === s).length;
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 12, padding: '8px 14px', boxShadow: 'var(--ve-shadow-sm)' }}>
              <Icon size={13} color={cfg.color} />
              <span style={{ fontSize: 12, color: cfg.color, fontWeight: 700 }}>{cnt} {s}</span>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--ve-shadow-sm)' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px 90px', padding: '12px 20px', borderBottom: '1px solid var(--ve-border)', background: 'var(--ve-surface-2)' }}>
          {['User', 'City / Goal', 'Joined', 'Sessions', 'Actions'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--ve-text-2)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--ve-text-3)', fontSize: 14 }}>No users match your search</p>
        )}

        {filtered.map((u, i) => {
          const sc = STATUS_CONFIG[u.status];
          const StatusIcon = sc.icon;
          return (
            <div
              key={u.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 100px 80px 90px',
                padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--ve-border)' : 'none',
                alignItems: 'center',
                background: i % 2 === 0 ? '#FFFFFF' : '#FAFBFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--ve-purple)', flexShrink: 0 }}>
                  {u.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--ve-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--ve-text)' }}>{u.city}</p>
                <p style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>{u.goal}</p>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{u.joinedDate}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)' }}>{u.sessionsBooked}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: sc.bg, borderRadius: 20, padding: '3px 8px' }}>
                  <StatusIcon size={11} color={sc.color} />
                  <span style={{ fontSize: 10, color: sc.color, fontWeight: 700, textTransform: 'capitalize' }}>{u.status}</span>
                </div>
                {u.status !== 'suspended' ? (
                  <button
                    onClick={() => updateUserStatus(u.id, 'suspended')}
                    title="Suspend"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 2 }}
                  >
                    <ShieldOff size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => updateUserStatus(u.id, 'active')}
                    title="Reactivate"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ve-success)', padding: 2 }}
                  >
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
