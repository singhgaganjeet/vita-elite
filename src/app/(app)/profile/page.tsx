'use client';

import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

type ProfileTab = 'personal' | 'measurements' | 'progress';

const measurements = [
  { label: 'Weight', value: '68.5', unit: 'kg', updated: '3 days ago' },
  { label: 'Height', value: '165', unit: 'cm', updated: '1 month ago' },
  { label: 'BMI', value: '25.2', unit: '', updated: '3 days ago' },
  { label: 'Chest', value: '88', unit: 'cm', updated: '1 week ago' },
  { label: 'Waist', value: '73', unit: 'cm', updated: '1 week ago' },
  { label: 'Hips', value: '94', unit: 'cm', updated: '1 week ago' },
  { label: 'Thighs', value: '56', unit: 'cm', updated: '2 weeks ago' },
  { label: 'Arms', value: '28', unit: 'cm', updated: '2 weeks ago' },
  { label: 'Neck', value: '33', unit: 'cm', updated: '1 month ago' },
  { label: 'Shoulders', value: '108', unit: 'cm', updated: '1 month ago' },
  { label: 'Body Fat', value: '26', unit: '%', updated: '1 month ago' },
  { label: 'Muscle Mass', value: '22', unit: 'kg', updated: '1 month ago' },
];

const weightTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  weight: +(70.5 - i * 0.07 + (Math.sin(i) * 0.3)).toFixed(1),
}));

const bmiTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  bmi: +(26.2 - i * 0.08 + (Math.cos(i) * 0.1)).toFixed(1),
}));

const calCompliance = [
  { day: 'Mon', hit: true },
  { day: 'Tue', hit: true },
  { day: 'Wed', hit: false },
  { day: 'Thu', hit: true },
  { day: 'Fri', hit: true },
  { day: 'Sat', hit: false },
  { day: 'Sun', hit: true },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>('personal');
  const [measurementValues, setMeasurementValues] = useState<Record<string, string>>(
    Object.fromEntries(measurements.map((m) => [m.label, m.value]))
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 24 }}>Profile</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: '#1A1A1A', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid #2E2E2E' }}>
        {(['personal', 'measurements', 'progress'] as ProfileTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 9,
              border: 'none',
              background: tab === t ? '#22C55E' : 'transparent',
              color: tab === t ? '#000000' : '#A0A0A0',
              fontSize: 13,
              fontWeight: tab === t ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}
          >
            {t === 'personal' ? 'Personal' : t === 'measurements' ? 'Measurements' : 'Progress'}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      {tab === 'personal' && (
        <div className="animate-fade-in-up">
          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(34,197,94,0.15)',
                  border: '3px solid rgba(34,197,94,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  fontWeight: 800,
                  color: '#22C55E',
                }}
              >
                P
              </div>
              <button
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#22C55E',
                  border: '2px solid #0A0A0A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Camera size={14} color="#000" />
              </button>
            </div>
          </div>

          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 20, padding: '24px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>First Name</label>
                  <input className="input-field" defaultValue="Priya" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Last Name</label>
                  <input className="input-field" defaultValue="Sharma" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Age</label>
                  <input className="input-field" type="number" defaultValue="28" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Date of Birth</label>
                  <input className="input-field" type="date" defaultValue="1997-03-15" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Sex</label>
                <select className="input-field" defaultValue="female" style={{ cursor: 'pointer' }}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Location</label>
                <input className="input-field" defaultValue="Mumbai, Maharashtra" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Email</label>
                <input className="input-field" type="email" defaultValue="priya.sharma@gmail.com" readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Phone</label>
                <input className="input-field" type="tel" defaultValue="+91 98765 43210" />
              </div>
              <button
                onClick={handleSave}
                className="btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {saved ? '✓ Saved!' : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body Measurements */}
      {tab === 'measurements' && (
        <div className="animate-fade-in-up">
          {/* Body SVG silhouette */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 20, padding: '20px', display: 'inline-block' }}>
              <svg width="120" height="200" viewBox="0 0 120 200" fill="none">
                {/* Head */}
                <circle cx="60" cy="22" r="16" stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                {/* Neck */}
                <line x1="54" y1="38" x2="52" y2="48" stroke="#22C55E" strokeWidth="2" />
                <line x1="66" y1="38" x2="68" y2="48" stroke="#22C55E" strokeWidth="2" />
                {/* Torso */}
                <path d="M40 50 Q30 60 28 90 L30 130 L90 130 L92 90 Q90 60 80 50 Z"
                  stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                {/* Left arm */}
                <path d="M40 55 Q20 65 18 100 L22 105 Q28 75 42 65 Z"
                  stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                {/* Right arm */}
                <path d="M80 55 Q100 65 102 100 L98 105 Q92 75 78 65 Z"
                  stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                {/* Left leg */}
                <path d="M42 130 Q38 160 36 195 L50 195 Q50 160 55 130 Z"
                  stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                {/* Right leg */}
                <path d="M78 130 Q82 160 84 195 L70 195 Q70 160 65 130 Z"
                  stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                {/* Measurement dots */}
                <circle cx="60" cy="22" r="3" fill="#22C55E" />
                <circle cx="60" cy="68" r="3" fill="#F5C518" />
                <circle cx="60" cy="90" r="3" fill="#F97316" />
                <circle cx="60" cy="110" r="3" fill="#22C55E" />
                <circle cx="20" cy="85" r="3" fill="#3B82F6" />
                <circle cx="100" cy="85" r="3" fill="#3B82F6" />
                <circle cx="44" cy="165" r="3" fill="#8B5CF6" />
                <circle cx="76" cy="165" r="3" fill="#8B5CF6" />
              </svg>
              <p style={{ fontSize: 11, color: '#A0A0A0', textAlign: 'center', marginTop: 8 }}>Body Measurements</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {measurements.map((m) => (
              <div
                key={m.label}
                style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 14, padding: '14px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#A0A0A0' }}>{m.label}</span>
                  <span style={{ fontSize: 10, color: '#555' }}>{m.updated}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    className="input-field"
                    value={measurementValues[m.label] || ''}
                    onChange={(e) => setMeasurementValues((p) => ({ ...p, [m.label]: e.target.value }))}
                    style={{ padding: '6px 10px', fontSize: 16, fontWeight: 700, flex: 1 }}
                  />
                  {m.unit && <span style={{ fontSize: 12, color: '#A0A0A0', flexShrink: 0 }}>{m.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {saved ? '✓ Updated!' : <><Save size={16} /> Update All</>}
          </button>
        </div>
      )}

      {/* Progress */}
      {tab === 'progress' && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Weight trend */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 20, padding: '20px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>Weight Trend</p>
            <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 16 }}>Last 30 days</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={weightTrend}>
                <XAxis dataKey="day" tick={{ fill: '#A0A0A0', fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#A0A0A0', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{ background: '#242424', border: '1px solid #2E2E2E', borderRadius: 10, color: '#FFFFFF' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((v: any) => [`${v} kg`, 'Weight']) as any}
                />
                <Line type="monotone" dataKey="weight" stroke="#22C55E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* BMI change */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 20, padding: '20px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>BMI Change</p>
            <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 16 }}>Monthly trend</p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={bmiTrend}>
                <XAxis dataKey="month" tick={{ fill: '#A0A0A0', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#A0A0A0', fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{ background: '#242424', border: '1px solid #2E2E2E', borderRadius: 10, color: '#FFFFFF' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((v: any) => [String(v), 'BMI']) as any}
                />
                <Line type="monotone" dataKey="bmi" stroke="#F5C518" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Calorie compliance */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 20, padding: '20px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>Calorie Compliance</p>
            <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 16 }}>Last 7 days</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {calCompliance.map((d) => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: '100%',
                      height: 60,
                      borderRadius: 8,
                      background: d.hit ? '#22C55E' : '#2E2E2E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                    }}
                  >
                    {d.hit ? '✓' : '×'}
                  </div>
                  <span style={{ fontSize: 10, color: '#A0A0A0' }}>{d.day}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#A0A0A0', marginTop: 12 }}>
              Goal hit <span style={{ color: '#22C55E', fontWeight: 700 }}>5 / 7</span> days this week
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
