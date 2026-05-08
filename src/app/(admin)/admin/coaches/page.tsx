'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, BadgeCheck, Star, MapPin, Clock } from 'lucide-react';
import { useAdminStore } from '@/stores/useAdminStore';
import { coaches } from '@/data/coaches';

type Tab = 'applications' | 'active';

export default function AdminCoachesPage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('applications');
  const { applications, updateApplicationStatus } = useAdminStore();
  useEffect(() => { setMounted(true); }, []);

  const pending = applications.filter(a => a.status === 'pending');
  const reviewed = applications.filter(a => a.status !== 'pending');

  if (!mounted) return <div style={{ padding: 24 }} />;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, background: 'var(--ve-bg)', minHeight: '100%' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>Coaches</h1>
      <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 24 }}>Manage coach applications and active listings</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--ve-surface-2)', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid var(--ve-border)', width: 'fit-content' }}>
        {[
          { key: 'applications' as Tab, label: `Applications (${pending.length} pending)` },
          { key: 'active' as Tab, label: `Active Coaches (${coaches.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '9px 20px',
              borderRadius: 9,
              border: 'none',
              background: tab === t.key ? 'var(--ve-gradient)' : 'transparent',
              color: tab === t.key ? '#FFFFFF' : 'var(--ve-text-3)',
              fontSize: 13,
              fontWeight: tab === t.key ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Applications tab */}
      {tab === 'applications' && (
        <div>
          {pending.length === 0 && reviewed.length === 0 && (
            <p style={{ color: 'var(--ve-text-3)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>No applications yet</p>
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
                Awaiting Review ({pending.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {pending.map(app => (
                  <div key={app.id} style={{ background: 'var(--ve-surface)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 18, padding: '20px', boxShadow: 'var(--ve-shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: 'var(--ve-purple)', flexShrink: 0 }}>
                        {app.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ve-text)' }}>{app.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--ve-purple)', background: 'rgba(124,58,237,0.08)', borderRadius: 20, padding: '2px 10px', fontWeight: 700, textTransform: 'capitalize' }}>{app.category}</span>
                          <span style={{ fontSize: 11, color: 'var(--ve-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> Applied {app.appliedDate}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <MapPin size={11} color="var(--ve-text-3)" />
                            <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{app.city}</span>
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{app.experience} yrs experience</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--ve-text-2)', lineHeight: 1.6, marginBottom: 12 }}>{app.bio}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {app.certifications.map(c => (
                        <span key={c} style={{ fontSize: 11, color: 'var(--ve-text-2)', background: 'var(--ve-surface-2)', border: '1px solid var(--ve-border)', borderRadius: 20, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <BadgeCheck size={10} color="var(--ve-purple)" />{c}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'approved')}
                        style={{
                          flex: 1,
                          padding: '11px',
                          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                          border: 'none',
                          borderRadius: 12,
                          color: '#FFFFFF',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
                        }}
                      >
                        <CheckCircle size={14} /> Approve &amp; List
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                        style={{
                          flex: 1,
                          padding: '11px',
                          background: 'rgba(239,68,68,0.06)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: 12,
                          color: '#EF4444',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed */}
          {reviewed.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ve-text-3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Reviewed</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reviewed.map((app, idx) => (
                  <div key={app.id} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#FAFBFF', border: '1px solid var(--ve-border)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ve-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--ve-text-3)', flexShrink: 0 }}>
                      {app.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)' }}>{app.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>{app.city} · {app.category}</p>
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: app.status === 'approved' ? 'var(--ve-success)' : '#EF4444',
                      background: app.status === 'approved' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                      borderRadius: 20,
                      padding: '3px 10px',
                      textTransform: 'capitalize',
                    }}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active coaches tab */}
      {tab === 'active' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {coaches.map(c => (
            <div key={c.id} style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 16, padding: '16px', boxShadow: 'var(--ve-shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ve-purple)', flexShrink: 0 }}>
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ve-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                    <BadgeCheck size={13} color="var(--ve-purple)" />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--ve-text-3)', textTransform: 'capitalize' }}>{c.category} · {c.city}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={11} color="#F59E0B" fill="#F59E0B" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ve-text)' }}>{c.rating}</span>
                  <span style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>({c.sessions})</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--ve-success)', fontWeight: 600 }}>₹{c.price.toLocaleString()}/session</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
