'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Eye, EyeOff, Dumbbell } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '', color: '#2E2E2E' },
    { label: 'Weak', color: '#EF4444' },
    { label: 'Fair', color: '#F97316' },
    { label: 'Good', color: '#F5C518' },
    { label: 'Strong', color: '#22C55E' },
  ];
  return { score, ...map[score] };
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const pwStrength = getPasswordStrength(form.password);

  const valueProps = [
    'Access 30+ certified coaches at home',
    'AI-powered calorie & nutrition tracker',
    'BMI & body measurement tools — free',
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(46,46,46,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(46,46,46,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.5,
        }}
      />

      {/* Left hero — desktop only */}
      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Dumbbell size={24} color="#22C55E" />
          </div>
          <div>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-1px' }}>VITA</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#22C55E', letterSpacing: '-1px' }}>ELITE</span>
          </div>
        </div>

        <h1
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: 24,
            maxWidth: 520,
          }}
        >
          Your Elite Health.
          <br />
          <span style={{ color: '#22C55E' }}>At Your Door.</span>
        </h1>

        <p style={{ fontSize: 18, color: '#A0A0A0', marginBottom: 40, maxWidth: 440, lineHeight: 1.6 }}>
          India&apos;s premium at-home wellness platform connecting you with the country&apos;s top coaches, dietitians, and physiotherapists.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {valueProps.map((prop, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(34,197,94,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={14} color="#22C55E" />
              </div>
              <span style={{ fontSize: 15, color: '#E0E0E0' }}>{prop}</span>
            </div>
          ))}
        </div>

        {/* Decorative green glow */}
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Right auth card */}
      <div
        style={{
          flex: '0 0 auto',
          width: '100%',
          maxWidth: 460,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          position: 'relative',
        }}
        className="lg:max-w-[460px]"
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#1A1A1A',
            border: '1px solid #2E2E2E',
            borderRadius: 24,
            padding: '40px 36px',
          }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Dumbbell size={22} color="#22C55E" />
            <span style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              VITA<span style={{ color: '#22C55E' }}>ELITE</span>
            </span>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 6, letterSpacing: '-0.5px' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 28 }}>
            {mode === 'signin'
              ? 'Sign in to your Vita Elite account'
              : 'Start your elite health journey today'}
          </p>

          {/* Demo credentials hint */}
          {mode === 'signin' && (
            <div
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 20,
                fontSize: 12,
              }}
            >
              <p style={{ color: '#22C55E', fontWeight: 600, marginBottom: 4 }}>Demo Credentials</p>
              <p style={{ color: '#A0A0A0' }}>Email: <span style={{ color: '#FFFFFF' }}>demo@vitaelite.com</span></p>
              <p style={{ color: '#A0A0A0' }}>Password: <span style={{ color: '#FFFFFF' }}>Demo@123</span></p>
            </div>
          )}

          {/* Google button */}
          <button
            style={{
              width: '100%',
              height: 48,
              borderRadius: 12,
              background: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              color: '#1A1A1A',
              marginBottom: 20,
              transition: 'opacity 0.2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.3-7.7 19.3-20 0-1.4-.1-2.7-.4-4H43.6z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.4 0 10.2-1.8 14-4.9l-6.5-5.3C29.5 35.6 26.9 36.6 24 36.6c-5.2 0-9.6-3-11.3-7.4l-6.5 5C9.6 40.5 16.3 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.7-2.7 4.9-5 6.3l6.5 5.3C40.6 36.3 44 30.6 44 24c0-1.4-.1-2.7-.4-4z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#2E2E2E' }} />
            <span style={{ fontSize: 12, color: '#A0A0A0' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#2E2E2E' }} />
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>
                    First Name
                  </label>
                  <input
                    className="input-field"
                    placeholder="Priya"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>
                    Last Name
                  </label>
                  <input
                    className="input-field"
                    placeholder="Sharma"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>
                Email address
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="priya@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 44 }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#A0A0A0',
                    padding: 2,
                  }}
                  type="button"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'signup' && form.password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 2,
                          background: i <= pwStrength.score ? pwStrength.color : '#2E2E2E',
                          transition: 'background 0.3s',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: pwStrength.color }}>{pwStrength.label}</span>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#A0A0A0',
                      padding: 2,
                    }}
                    type="button"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <Link href={mode === 'signin' ? '/dashboard' : '/onboarding'} style={{ textDecoration: 'none' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', fontSize: 15 }}
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </Link>
          </div>

          {/* Toggle */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#A0A0A0' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22C55E', fontWeight: 600, fontSize: 14 }}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
