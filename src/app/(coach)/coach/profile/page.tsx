'use client';

import { useState, useEffect } from 'react';
import { Save, Star, MapPin, BadgeCheck } from 'lucide-react';
import { coaches } from '@/data/coaches';

export default function CoachProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const coach = coaches[0];

  const [form, setForm] = useState({
    tagline: coach.tagline,
    bio: coach.bio,
    price: coach.price,
    availability: [...coach.availability],
  });

  useEffect(() => { setMounted(true); }, []);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      availability: f.availability.includes(day)
        ? f.availability.filter(d => d !== day)
        : [...f.availability, day],
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!mounted) return <div style={{ padding: 24 }} />;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>My Profile</h1>
          <p style={{ fontSize: 13, color: 'var(--ve-text-3)' }}>Your public coaching profile on Vita Elite</p>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 22px',
            background: saved ? 'rgba(16,185,129,0.10)' : 'var(--ve-gradient)',
            border: saved ? '1px solid rgba(16,185,129,0.30)' : 'none',
            borderRadius: 12,
            color: saved ? 'var(--ve-success)' : '#FFFFFF',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: saved ? 'none' : 'var(--ve-shadow)',
            transition: 'all 0.2s',
          }}
        >
          <Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Profile card preview */}
      <div style={{
        background: 'var(--ve-surface)',
        border: '1px solid var(--ve-border)',
        borderRadius: 18, padding: '20px', marginBottom: 20,
        boxShadow: 'var(--ve-shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--ve-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#FFFFFF', flexShrink: 0,
            boxShadow: 'var(--ve-shadow)',
          }}>
            {coach.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ve-text)' }}>{coach.name}</h2>
              <BadgeCheck size={16} color="var(--ve-purple)" />
            </div>
            <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 8 }}>{coach.designation}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Star size={13} color="#F59E0B" fill="#F59E0B" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ve-text)' }}>{coach.rating}</span>
                <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>({coach.sessions} sessions)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={12} color="var(--ve-text-3)" />
                <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{coach.city}</span>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700,
                background: 'var(--ve-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>₹{coach.price.toLocaleString()}/session</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {coach.specialisations.map(s => (
            <span key={s} style={{
              fontSize: 11, color: 'var(--ve-text-2)',
              background: 'var(--ve-surface-2)',
              borderRadius: 20, padding: '3px 10px',
              border: '1px solid var(--ve-border)',
            }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Editable fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Tagline */}
        <div style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 16, padding: '18px 20px',
          boxShadow: 'var(--ve-shadow-sm)',
        }}>
          <label style={{
            fontSize: 12, fontWeight: 700, color: 'var(--ve-text-2)',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            display: 'block', marginBottom: 10,
          }}>Tagline</label>
          <input
            value={form.tagline}
            onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
            className="input-field"
            style={{
              width: '100%',
              background: 'var(--ve-surface-2)',
              border: '1px solid var(--ve-border)',
              color: 'var(--ve-text)',
              fontSize: 14,
              borderRadius: 10,
              padding: '10px 14px',
            }}
          />
        </div>

        {/* Bio */}
        <div style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 16, padding: '18px 20px',
          boxShadow: 'var(--ve-shadow-sm)',
        }}>
          <label style={{
            fontSize: 12, fontWeight: 700, color: 'var(--ve-text-2)',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            display: 'block', marginBottom: 10,
          }}>Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={5}
            style={{
              width: '100%',
              background: 'var(--ve-surface-2)',
              border: '1px solid var(--ve-border)',
              borderRadius: 10, color: 'var(--ve-text)',
              fontSize: 13, padding: '12px 14px',
              resize: 'vertical', lineHeight: 1.6,
              outline: 'none',
            }}
          />
          <p style={{ fontSize: 11, color: 'var(--ve-text-3)', marginTop: 6 }}>{form.bio.length} characters</p>
        </div>

        {/* Session Price */}
        <div style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 16, padding: '18px 20px',
          boxShadow: 'var(--ve-shadow-sm)',
        }}>
          <label style={{
            fontSize: 12, fontWeight: 700, color: 'var(--ve-text-2)',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            display: 'block', marginBottom: 10,
          }}>Session Price (₹)</label>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
            className="input-field"
            style={{
              width: 180,
              background: 'var(--ve-surface-2)',
              border: '1px solid var(--ve-border)',
              color: 'var(--ve-text)',
              fontSize: 14,
              borderRadius: 10,
              padding: '10px 14px',
            }}
          />
        </div>

        {/* Availability */}
        <div style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 16, padding: '18px 20px',
          boxShadow: 'var(--ve-shadow-sm)',
        }}>
          <label style={{
            fontSize: 12, fontWeight: 700, color: 'var(--ve-text-2)',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            display: 'block', marginBottom: 12,
          }}>Availability</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DAYS.map(day => {
              const active = form.availability.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  style={{
                    padding: '8px 14px', borderRadius: 20,
                    border: `1px solid ${active ? 'var(--ve-purple)' : 'var(--ve-border)'}`,
                    background: active ? 'rgba(124,58,237,0.08)' : 'var(--ve-surface-2)',
                    color: active ? 'var(--ve-purple)' : 'var(--ve-text-3)',
                    fontSize: 13, fontWeight: active ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Certifications (read-only) */}
        <div style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 16, padding: '18px 20px',
          boxShadow: 'var(--ve-shadow-sm)',
        }}>
          <label style={{
            fontSize: 12, fontWeight: 700, color: 'var(--ve-text-2)',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            display: 'block', marginBottom: 10,
          }}>Certifications</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {coach.certifications.map(cert => (
              <div key={cert} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BadgeCheck size={14} color="var(--ve-purple)" />
                <span style={{ fontSize: 13, color: 'var(--ve-text)' }}>{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
