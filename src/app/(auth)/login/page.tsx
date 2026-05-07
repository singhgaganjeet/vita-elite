'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Eye, EyeOff, Dumbbell, User, Users, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuthStore, type UserRole } from '@/stores/useAuthStore';

type AuthMode = 'signin' | 'signup';

const ROLE_CONFIG: Record<UserRole, {
  label: string; icon: typeof User; color: string; bg: string;
  email: string; password: string; redirect: string; hint: string;
}> = {
  user: {
    label: 'User', icon: User, color: '#22C55E', bg: 'rgba(34,197,94,0.1)',
    email: 'demo@vitaelite.com', password: 'Demo@123',
    redirect: '/dashboard', hint: 'Track nutrition, book coaches, analyse meals',
  },
  coach: {
    label: 'Coach', icon: Users, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',
    email: 'coach@vitaelite.com', password: 'Coach@123',
    redirect: '/coach/dashboard', hint: 'Manage bookings, clients & your profile',
  },
  admin: {
    label: 'Admin', icon: ShieldCheck, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',
    email: 'admin@vitaelite.com', password: 'Admin@123',
    redirect: '/admin/dashboard', hint: 'Oversee platform, users & coaches',
  },
};

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return [
    { label: '', color: '#2E2E2E' },
    { label: 'Weak', color: '#EF4444' },
    { label: 'Fair', color: '#F97316' },
    { label: 'Good', color: '#F5C518' },
    { label: 'Strong', color: '#22C55E' },
  ][score] as { label: string; color: string } & { score: number };
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);

  const [mode, setMode] = useState<AuthMode>('signin');
  const [activeRole, setActiveRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });

  const cfg = ROLE_CONFIG[activeRole];
  const pwStrength = getPasswordStrength(form.password);

  const handleSignIn = () => {
    setAuthError('');
    const result = login(form.email, form.password);
    if (!result.success) { setAuthError(result.error ?? 'Login failed.'); return; }
    router.push(ROLE_CONFIG[result.role!].redirect);
  };

  const handleQuickDemo = () => {
    const result = login(cfg.email, cfg.password);
    if (result.success) router.push(cfg.redirect);
  };

  const handleSignUp = () => {
    router.push('/onboarding');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Grid bg */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(46,46,46,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(46,46,46,0.4) 1px, transparent 1px)', backgroundSize: '48px 48px', opacity: 0.5, pointerEvents: 'none' }} />

      {/* Left hero */}
      <div className="hidden lg:flex" style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '64px 72px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dumbbell size={24} color="#22C55E" />
          </div>
          <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1px' }}>
            <span style={{ color: '#FFFFFF' }}>VITA</span><span style={{ color: '#22C55E' }}>ELITE</span>
          </span>
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24, maxWidth: 520 }}>
          Your Elite Health.<br /><span style={{ color: '#22C55E' }}>At Your Door.</span>
        </h1>
        <p style={{ fontSize: 17, color: '#A0A0A0', marginBottom: 40, maxWidth: 440, lineHeight: 1.6 }}>
          India&apos;s premium at-home wellness platform connecting users with top coaches, dietitians, and physiotherapists.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Access 30+ certified coaches at home', 'AI-powered calorie & food analyser', 'BMI & body measurement tracker'].map((prop, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={13} color="#22C55E" />
              </div>
              <span style={{ fontSize: 15, color: '#E0E0E0' }}>{prop}</span>
            </div>
          ))}
        </div>

        {/* Role cards on hero side */}
        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#606060', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Three portals, one platform</p>
          {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG['user']][]).map(([role, c]) => {
            const Icon = c.icon;
            return (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color={c.color} />
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{c.label} Portal</span>
                  <span style={{ fontSize: 12, color: '#A0A0A0', marginLeft: 8 }}>{c.hint}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </div>

      {/* Right auth card */}
      <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', position: 'relative' }} className="lg:max-w-[480px]">
        <div style={{ width: '100%', maxWidth: 440, background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 24, padding: '36px 32px' }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Dumbbell size={22} color="#22C55E" />
            <span style={{ fontSize: 22, fontWeight: 900 }}><span style={{ color: '#FFFFFF' }}>VITA</span><span style={{ color: '#22C55E' }}>ELITE</span></span>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, color: '#A0A0A0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Sign in as</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG['user']][]).map(([role, c]) => {
                const Icon = c.icon;
                const active = activeRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => { setActiveRole(role); setAuthError(''); }}
                    style={{
                      padding: '12px 8px', borderRadius: 12, border: `1px solid ${active ? c.color : '#2E2E2E'}`,
                      background: active ? c.bg : 'transparent', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={18} color={active ? c.color : '#606060'} />
                    <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? c.color : '#A0A0A0' }}>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.5px' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 22 }}>
            {mode === 'signin' ? `Sign in to your ${cfg.label} portal` : 'Start your elite health journey'}
          </p>

          {/* Demo credentials */}
          {mode === 'signin' && (
            <div style={{ background: `${cfg.bg}`, border: `1px solid ${cfg.color}30`, borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>Demo Credentials — {cfg.label}</p>
                <button
                  onClick={handleQuickDemo}
                  style={{ fontSize: 11, color: cfg.color, background: `${cfg.color}20`, border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 700 }}
                >
                  Auto-fill & Login →
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#A0A0A0' }}>Email: <span style={{ color: '#FFFFFF' }}>{cfg.email}</span></p>
              <p style={{ fontSize: 12, color: '#A0A0A0' }}>Password: <span style={{ color: '#FFFFFF' }}>{cfg.password}</span></p>
            </div>
          )}

          {/* Error */}
          {authError && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={14} color="#EF4444" />
              <p style={{ fontSize: 13, color: '#EF4444' }}>{authError}</p>
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>First Name</label>
                  <input className="input-field" placeholder="Priya" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Last Name</label>
                  <input className="input-field" placeholder="Sharma" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Email address</label>
              <input className="input-field" type="email" placeholder={cfg.email} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A0A0A0' }} type="button">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'signup' && form.password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength.score ? pwStrength.color : '#2E2E2E', transition: 'background 0.3s' }} />)}
                  </div>
                  <span style={{ fontSize: 11, color: pwStrength.color }}>{pwStrength.label}</span>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input-field" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} style={{ paddingRight: 44 }} />
                  <button onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A0A0A0' }} type="button">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={mode === 'signin' ? handleSignIn : handleSignUp}
              style={{ width: '100%', height: 48, borderRadius: 12, background: cfg.color, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: activeRole === 'user' ? '#000' : '#000', transition: 'opacity 0.2s' }}
            >
              {mode === 'signin' ? `Sign In as ${cfg.label}` : 'Create Account'}
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: '#A0A0A0' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setAuthError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: cfg.color, fontWeight: 600, fontSize: 14 }}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
