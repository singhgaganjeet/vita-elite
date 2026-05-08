'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, Eye, EyeOff, User, Users, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore, type UserRole } from '@/stores/useAuthStore';

type AuthMode = 'signin' | 'signup';

const ROLE_CONFIG: Record<UserRole, {
  label: string; icon: typeof User; color: string; bg: string; border: string;
  email: string; password: string; redirect: string; hint: string;
}> = {
  user: {
    label: 'Member', icon: User,
    color: '#7C3AED', bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.3)',
    email: 'demo@vitaelite.com', password: 'Demo@123',
    redirect: '/dashboard', hint: 'Track nutrition, book coaches, analyse meals',
  },
  coach: {
    label: 'Coach', icon: Users,
    color: '#A855F7', bg: 'rgba(168,85,247,0.07)', border: 'rgba(168,85,247,0.3)',
    email: 'coach@vitaelite.com', password: 'Coach@123',
    redirect: '/coach/dashboard', hint: 'Manage bookings, clients & your profile',
  },
  admin: {
    label: 'Admin', icon: ShieldCheck,
    color: '#EC4899', bg: 'rgba(236,72,153,0.07)', border: 'rgba(236,72,153,0.3)',
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
  return ([
    { score: 0, label: '', color: 'var(--ve-border)' },
    { score: 1, label: 'Weak', color: '#EF4444' },
    { score: 2, label: 'Fair', color: '#F97316' },
    { score: 3, label: 'Good', color: '#F59E0B' },
    { score: 4, label: 'Strong', color: '#10B981' },
  ] as { score: number; label: string; color: string }[])[score];
}

export default function LoginPage() {
  const router = useRouter();
  const loginAsync = useAuthStore(s => s.loginAsync);

  const [mode, setMode] = useState<AuthMode>('signin');
  const [activeRole, setActiveRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });

  const cfg = ROLE_CONFIG[activeRole];
  const pwStrength = getPasswordStrength(form.password);

  const handleSignIn = async () => {
    setAuthError('');
    setLoading(true);
    const result = await loginAsync(form.email, form.password);
    setLoading(false);
    if (!result.success) { setAuthError(result.error ?? 'Login failed.'); return; }
    router.push(ROLE_CONFIG[result.role!].redirect);
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    const result = await loginAsync(cfg.email, cfg.password);
    setLoading(false);
    if (result.success) router.push(cfg.redirect);
    else setAuthError(result.error ?? 'Demo login failed.');
  };

  const handleSignUp = () => router.push('/onboarding');

  return (
    <div style={{ minHeight: '100vh', background: '#FDFCFF', display: 'flex', position: 'relative', overflow: 'hidden' }}>

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -120, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Left hero */}
      <div className="hidden lg:flex" style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', padding: '64px 72px', position: 'relative' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
          <Image src="/logo.png" alt="Vita Elite" width={52} height={52} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              <span style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Vita Elite
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ve-text-3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500 }}>
              Premium Wellness
            </div>
          </div>
        </div>

        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 54, fontWeight: 600, color: 'var(--ve-text)', lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: 20, maxWidth: 520 }}>
          Your Elite Health.<br />
          <span style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>
            At Your Door.
          </span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ve-text-2)', marginBottom: 44, maxWidth: 420, lineHeight: 1.7 }}>
          India&apos;s premium at-home wellness platform connecting you with top coaches, dietitians, and physiotherapists.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {['Access 30+ certified coaches at home', 'AI-powered calorie & food analyser', 'BMI & body measurement tracker'].map((prop, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={12} color="var(--ve-purple)" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 15, color: 'var(--ve-text-2)' }}>{prop}</span>
            </div>
          ))}
        </div>

        {/* Role info cards */}
        <div style={{ marginTop: 52, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--ve-text-3)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 600 }}>Three portals, one platform</p>
          {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG['user']][]).map(([role, c]) => {
            const Icon = c.icon;
            return (
              <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} color={c.color} />
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)' }}>{c.label} Portal</span>
                  <span style={{ fontSize: 12, color: 'var(--ve-text-3)', marginLeft: 8 }}>{c.hint}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right auth card */}
      <div
        style={{ flex: '0 0 auto', width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', position: 'relative' }}
        className="lg:max-w-[480px]"
      >
        <div style={{ width: '100%', maxWidth: 440, background: '#FFFFFF', border: '1px solid var(--ve-border)', borderRadius: 24, padding: '36px 32px', boxShadow: '0 8px 48px rgba(124,58,237,0.10)' }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Image src="/logo.png" alt="Vita Elite" width={32} height={32} style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Cormorant Garamond, Georgia, serif', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Vita Elite
            </span>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, color: 'var(--ve-text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
              Sign in as
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG['user']][]).map(([role, c]) => {
                const Icon = c.icon;
                const active = activeRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => { setActiveRole(role); setAuthError(''); }}
                    style={{
                      padding: '12px 8px', borderRadius: 12,
                      border: `1.5px solid ${active ? c.color : 'var(--ve-border)'}`,
                      background: active ? c.bg : 'transparent',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={18} color={active ? c.color : 'var(--ve-text-3)'} />
                    <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? c.color : 'var(--ve-text-3)' }}>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 26, fontWeight: 600, color: 'var(--ve-text)', marginBottom: 4, letterSpacing: '-0.5px' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 22 }}>
            {mode === 'signin' ? `Sign in to your ${cfg.label} portal` : 'Start your elite wellness journey'}
          </p>

          {/* Demo credentials */}
          {mode === 'signin' && (
            <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={12} color={cfg.color} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>Demo — {cfg.label}</p>
                </div>
                <button
                  onClick={handleQuickDemo}
                  disabled={loading}
                  style={{ fontSize: 11, color: cfg.color, background: `${cfg.color}18`, border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 700 }}
                >
                  {loading ? '…' : 'Auto Login →'}
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ve-text-2)' }}>Email: <span style={{ color: 'var(--ve-text)', fontWeight: 500 }}>{cfg.email}</span></p>
              <p style={{ fontSize: 12, color: 'var(--ve-text-2)' }}>Password: <span style={{ color: 'var(--ve-text)', fontWeight: 500 }}>{cfg.password}</span></p>
            </div>
          )}

          {/* Error */}
          {authError && (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={14} color="#EF4444" />
              <p style={{ fontSize: 13, color: '#EF4444' }}>{authError}</p>
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--ve-text-2)', display: 'block', marginBottom: 6, fontWeight: 500 }}>First Name</label>
                  <input className="input-field" placeholder="Priya" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--ve-text-2)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Last Name</label>
                  <input className="input-field" placeholder="Sharma" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, color: 'var(--ve-text-2)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Email address</label>
              <input className="input-field" type="email" placeholder={cfg.email} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--ve-text-2)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 44 }}
                  onKeyDown={e => e.key === 'Enter' && mode === 'signin' && handleSignIn()}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ve-text-3)' }}
                  type="button"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'signup' && form.password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength.score ? pwStrength.color : 'var(--ve-border)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: pwStrength.color, fontWeight: 500 }}>{pwStrength.label}</span>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 12, color: 'var(--ve-text-2)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ve-text-3)' }}
                    type="button"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={mode === 'signin' ? handleSignIn : handleSignUp}
              disabled={loading}
              style={{
                width: '100%', height: 50, borderRadius: 12,
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 15, fontWeight: 600, color: '#FFFFFF',
                transition: 'all 0.2s', opacity: loading ? 0.75 : 1,
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {loading ? 'Please wait…' : mode === 'signin' ? `Sign In as ${cfg.label}` : 'Create Account'}
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ve-text-3)' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setAuthError(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background2: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'var(--ve-purple)' } as React.CSSProperties}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
