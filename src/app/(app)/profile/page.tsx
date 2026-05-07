'use client';

import { useState, useEffect } from 'react';
import { Camera, Save, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useUserStore, type BodyMeasurements } from '@/stores/useUserStore';
import { useNutritionStore } from '@/stores/useNutritionStore';

type ProfileTab = 'personal' | 'measurements' | 'progress';

type MeasurementKey = keyof BodyMeasurements;

const MEASUREMENT_FIELDS: { key: MeasurementKey; label: string; unit: string }[] = [
  { key: 'weight', label: 'Weight', unit: 'kg' },
  { key: 'height', label: 'Height', unit: 'cm' },
  { key: 'neck', label: 'Neck', unit: 'cm' },
  { key: 'shoulders', label: 'Shoulders', unit: 'cm' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'hips', label: 'Hips', unit: 'cm' },
  { key: 'bicepsLeft', label: 'Biceps L', unit: 'cm' },
  { key: 'bicepsRight', label: 'Biceps R', unit: 'cm' },
  { key: 'forearmsLeft', label: 'Forearm L', unit: 'cm' },
  { key: 'forearmsRight', label: 'Forearm R', unit: 'cm' },
  { key: 'thighLeft', label: 'Thigh L', unit: 'cm' },
  { key: 'thighRight', label: 'Thigh R', unit: 'cm' },
  { key: 'calfLeft', label: 'Calf L', unit: 'cm' },
  { key: 'calfRight', label: 'Calf R', unit: 'cm' },
];

function LoadingSkeleton() {
  return (
    <div style={{ padding: '24px 20px' }}>
      <div style={{ height: 40, background: '#1A1A1A', borderRadius: 12, marginBottom: 24, width: '30%' }} />
      <div style={{ height: 50, background: '#1A1A1A', borderRadius: 12, marginBottom: 24 }} />
      <div style={{ height: 300, background: '#1A1A1A', borderRadius: 20 }} />
    </div>
  );
}

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<ProfileTab>('personal');
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const profile = useUserStore((s) => s.profile);
  const measurements = useUserStore((s) => s.measurements);
  const setProfile = useUserStore((s) => s.setProfile);
  const addMeasurement = useUserStore((s) => s.addMeasurement);
  const getBMI = useUserStore((s) => s.getBMI);
  const logout = useUserStore((s) => s.logout);
  const getWeeklyData = useNutritionStore((s) => s.getWeeklyData);
  const getDailyCalorieGoal = useUserStore((s) => s.getDailyCalorieGoal);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Personal form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'prefer-not-to-say'>('female');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [activityLevel, setActivityLevel] = useState<typeof profile.activityLevel>('lightly-active');

  // Measurement form state
  const [measurementInputs, setMeasurementInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    const parts = profile.name.split(' ');
    setFirstName(parts[0] ?? '');
    setLastName(parts.slice(1).join(' ') ?? '');
    setAge(String(profile.age));
    setDob(profile.dob);
    setSex(profile.sex);
    setCity(profile.city);
    setState(profile.state);
    setPhone(profile.phone);
    setActivityLevel(profile.activityLevel);

    // Init measurement inputs from latest values
    const inputs: Record<string, string> = {};
    MEASUREMENT_FIELDS.forEach(({ key }) => {
      const arr = measurements[key];
      inputs[key] = arr.length > 0 ? String(arr[arr.length - 1].value) : '';
    });
    setMeasurementInputs(inputs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return <LoadingSkeleton />;

  const handleSavePersonal = () => {
    setProfile({
      name: `${firstName} ${lastName}`.trim(),
      age: parseInt(age) || profile.age,
      dob,
      sex,
      city,
      state,
      phone,
      activityLevel,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveMeasurements = () => {
    MEASUREMENT_FIELDS.forEach(({ key }) => {
      const val = parseFloat(measurementInputs[key] ?? '');
      if (!isNaN(val) && val > 0) {
        addMeasurement(key, val);
      }
    });
    // Update profile weight/height from measurements
    const newWeight = parseFloat(measurementInputs.weight ?? '');
    const newHeight = parseFloat(measurementInputs.height ?? '');
    if (!isNaN(newWeight) && newWeight > 0) setProfile({ weight: newWeight });
    if (!isNaN(newHeight) && newHeight > 0) setProfile({ height: newHeight });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Weight trend for chart
  const weightData = measurements.weight.slice(-30).map((m, i) => ({
    day: `Day ${i + 1}`,
    weight: m.value,
  }));

  // Weekly calorie compliance
  const weeklyData = getWeeklyData();
  const calGoal = getDailyCalorieGoal();
  const calCompliance = weeklyData.map((d) => ({ day: d.day, hit: d.calories >= calGoal }));
  const goalHitCount = calCompliance.filter((d) => d.hit).length;

  const bmi = getBMI();
  const bmiCategory =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25 ? 'Normal' :
    bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor =
    bmi < 18.5 ? '#3B82F6' :
    bmi < 25 ? '#22C55E' :
    bmi < 30 ? '#F5C518' : '#EF4444';

  return (
    <div style={{ padding: '24px 20px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>Profile</h1>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)', color: '#EF4444',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>

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
                {firstName.charAt(0).toUpperCase()}
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
                  <input className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Last Name</label>
                  <input className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Age</label>
                  <input className="input-field" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Date of Birth</label>
                  <input className="input-field" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Sex</label>
                <select
                  className="input-field"
                  value={sex}
                  onChange={(e) => setSex(e.target.value as typeof sex)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>City</label>
                  <input className="input-field" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>State</label>
                  <input className="input-field" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Email</label>
                <input className="input-field" type="email" value={profile.email} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Phone</label>
                <input className="input-field" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Activity Level</label>
                <select
                  className="input-field"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as typeof activityLevel)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="sedentary">Sedentary (desk job, no exercise)</option>
                  <option value="lightly-active">Lightly Active (1-3 days/week)</option>
                  <option value="moderately-active">Moderately Active (3-5 days/week)</option>
                  <option value="very-active">Very Active (6-7 days/week)</option>
                  <option value="extremely-active">Extremely Active (athlete)</option>
                </select>
              </div>

              {/* BMI badge */}
              <div style={{ background: '#242424', borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 11, color: '#A0A0A0', marginBottom: 2 }}>Current BMI</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: bmiColor, lineHeight: 1 }}>{bmi}</p>
                </div>
                <div style={{ padding: '6px 14px', borderRadius: 20, background: `${bmiColor}18`, border: `1px solid ${bmiColor}40`, color: bmiColor, fontSize: 12, fontWeight: 600 }}>
                  {bmiCategory}
                </div>
              </div>

              <button
                onClick={handleSavePersonal}
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
                <circle cx="60" cy="22" r="16" stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                <line x1="54" y1="38" x2="52" y2="48" stroke="#22C55E" strokeWidth="2" />
                <line x1="66" y1="38" x2="68" y2="48" stroke="#22C55E" strokeWidth="2" />
                <path d="M40 50 Q30 60 28 90 L30 130 L90 130 L92 90 Q90 60 80 50 Z" stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                <path d="M40 55 Q20 65 18 100 L22 105 Q28 75 42 65 Z" stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                <path d="M80 55 Q100 65 102 100 L98 105 Q92 75 78 65 Z" stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                <path d="M42 130 Q38 160 36 195 L50 195 Q50 160 55 130 Z" stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
                <path d="M78 130 Q82 160 84 195 L70 195 Q70 160 65 130 Z" stroke="#22C55E" strokeWidth="2" fill="rgba(34,197,94,0.05)" />
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
            {MEASUREMENT_FIELDS.map(({ key, label, unit }) => {
              const arr = measurements[key];
              const latest = arr.length > 0 ? arr[arr.length - 1] : null;
              const daysAgo = latest
                ? Math.round((Date.now() - new Date(latest.date).getTime()) / 86400000)
                : null;
              return (
                <div key={key} style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 14, padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#A0A0A0' }}>{label}</span>
                    {daysAgo !== null && (
                      <span style={{ fontSize: 10, color: '#555' }}>
                        {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      className="input-field"
                      type="number"
                      value={measurementInputs[key] ?? ''}
                      onChange={(e) =>
                        setMeasurementInputs((p) => ({ ...p, [key]: e.target.value }))
                      }
                      style={{ padding: '6px 10px', fontSize: 16, fontWeight: 700, flex: 1 }}
                    />
                    {unit && <span style={{ fontSize: 12, color: '#A0A0A0', flexShrink: 0 }}>{unit}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSaveMeasurements}
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
            <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 16 }}>Last {weightData.length} entries</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={weightData}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: '#A0A0A0' }}>Start</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{weightData[0]?.weight ?? '-'} kg</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: '#A0A0A0' }}>Change</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#22C55E' }}>
                  {weightData.length >= 2
                    ? `${((weightData[weightData.length - 1].weight - weightData[0].weight)).toFixed(1)} kg`
                    : '-'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: '#A0A0A0' }}>Current</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{weightData[weightData.length - 1]?.weight ?? '-'} kg</p>
              </div>
            </div>
          </div>

          {/* BMI card */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 20, padding: '20px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>Body Composition</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'BMI', value: String(bmi), unit: '', color: bmiColor },
                { label: 'Weight', value: String(measurements.weight.slice(-1)[0]?.value ?? profile.weight), unit: 'kg', color: '#FFFFFF' },
                { label: 'Height', value: String(measurements.height.slice(-1)[0]?.value ?? profile.height), unit: 'cm', color: '#FFFFFF' },
                { label: 'Category', value: bmiCategory, unit: '', color: bmiColor },
              ].map((item) => (
                <div key={item.label} style={{ background: '#242424', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: '#A0A0A0', marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}<span style={{ fontSize: 12, color: '#A0A0A0' }}>{item.unit}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Calorie Compliance */}
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
              Goal hit <span style={{ color: '#22C55E', fontWeight: 700 }}>{goalHitCount} / 7</span> days this week
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
