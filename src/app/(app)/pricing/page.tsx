'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap } from 'lucide-react';

type Duration = '1mo' | '3mo' | '6mo' | '12mo';

const durations: { key: Duration; label: string; months: number }[] = [
  { key: '1mo', label: '1 Month', months: 1 },
  { key: '3mo', label: '3 Months', months: 3 },
  { key: '6mo', label: '6 Months', months: 6 },
  { key: '12mo', label: '12 Months', months: 12 },
];

const discounts: Record<Duration, number> = {
  '1mo': 0,
  '3mo': 0.1,
  '6mo': 0.2,
  '12mo': 0.35,
};

const categories = [
  {
    key: 'fitness',
    label: 'Fitness Coaching',
    basePrice: 5000,
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.06)',
    borderColor: 'rgba(124,58,237,0.2)',
    description: 'Personal trainers, strength coaches, yoga instructors & more',
    features: [
      'Daily home workout sessions',
      'Personalised exercise programme',
      'Progress tracking & check-ins',
      'Nutrition basics guidance',
      'WhatsApp support',
    ],
  },
  {
    key: 'diet',
    label: 'Diet Consultation',
    basePrice: 3500,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.06)',
    borderColor: 'rgba(139,92,246,0.2)',
    description: 'Clinical dietitians, sports nutritionists & wellness experts',
    features: [
      'Personalised meal plans',
      'Weekly diet review sessions',
      'Grocery & meal prep guidance',
      'Supplement recommendations',
      'WhatsApp support',
    ],
  },
  {
    key: 'physio',
    label: 'Physiotherapy',
    basePrice: 6500,
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.06)',
    borderColor: 'rgba(236,72,153,0.2)',
    description: 'Certified physiotherapists & rehabilitation specialists',
    features: [
      'In-home physiotherapy sessions',
      'Personalised rehab programme',
      'Pain management protocols',
      'Progress assessment',
      'Between-session exercises',
    ],
  },
];

export default function PricingPage() {
  const [duration, setDuration] = useState<Duration>('1mo');

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto', background: 'var(--ve-bg, #F8F5FF)', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ve-text, #1A0A2E)', letterSpacing: '-0.5px', marginBottom: 8 }}>
          Pay Once. Train All Year.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ve-text-3, #9B8EC4)' }}>
          No hidden fees. Cancel anytime. First session just ₹100.
        </p>
      </div>

      {/* Trial banner */}
      <div
        style={{
          background: 'rgba(124,58,237,0.06)',
          border: '1px solid rgba(124,58,237,0.18)',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--ve-purple, #7C3AED)', marginBottom: 4 }}>
            🎉 Start with a 1-Day Trial — Just ₹100
          </p>
          <p style={{ fontSize: 13, color: 'var(--ve-text-3, #9B8EC4)' }}>
            We only charge ₹100 as a logistics fee for your first home visit. Absolutely no subscription needed.
          </p>
        </div>
        <Link href="/coaches" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '0 24px', fontSize: 14, flexShrink: 0 }}>
            Book Trial
          </button>
        </Link>
      </div>

      {/* Duration toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div style={{ background: 'var(--ve-surface, #FFFFFF)', border: '1px solid var(--ve-border, #E8E0FA)', borderRadius: 12, padding: 4, display: 'flex', gap: 4, boxShadow: '0 2px 12px rgba(124,58,237,0.07)' }}>
          {durations.map((d) => (
            <button
              key={d.key}
              onClick={() => setDuration(d.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 9,
                border: 'none',
                background: duration === d.key ? 'linear-gradient(135deg, #7C3AED, #EC4899)' : 'transparent',
                color: duration === d.key ? '#FFFFFF' : 'var(--ve-text-3, #9B8EC4)',
                fontSize: 13,
                fontWeight: duration === d.key ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                position: 'relative',
              }}
            >
              {d.label}
              {d.key === '12mo' && (
                <span
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                    color: '#FFFFFF',
                    fontSize: 8,
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: 6,
                  }}
                >
                  BEST
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {categories.map((cat) => {
          const disc = discounts[duration];
          const discountedPrice = Math.round(cat.basePrice * (1 - disc));
          const dur = durations.find((d) => d.key === duration)!;
          const totalOriginal = cat.basePrice * dur.months;
          const totalDiscounted = discountedPrice * dur.months;
          const savings = totalOriginal - totalDiscounted;

          return (
            <div
              key={cat.key}
              style={{
                background: 'var(--ve-surface, #FFFFFF)',
                border: `1px solid ${cat.borderColor}`,
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
              }}
            >
              {/* Card header */}
              <div style={{ background: cat.bg, padding: '20px 20px 16px', borderBottom: `1px solid ${cat.borderColor}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: cat.color, marginBottom: 4 }}>{cat.label}</p>
                <p style={{ fontSize: 12, color: 'var(--ve-text-3, #9B8EC4)', lineHeight: 1.4 }}>{cat.description}</p>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Price */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    {disc > 0 && (
                      <span style={{ fontSize: 16, color: 'var(--ve-text-3, #9B8EC4)', textDecoration: 'line-through' }}>
                        ₹{cat.basePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span style={{ fontSize: 32, fontWeight: 900, color: cat.color }}>
                      ₹{discountedPrice.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--ve-text-3, #9B8EC4)' }}>/month</span>
                  </div>
                  {dur.months > 1 && (
                    <p style={{ fontSize: 12, color: 'var(--ve-text-3, #9B8EC4)' }}>
                      Total: <span style={{ color: 'var(--ve-text, #1A0A2E)', fontWeight: 600 }}>₹{totalDiscounted.toLocaleString('en-IN')}</span>
                      {savings > 0 && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 8,
                            background: 'rgba(124,58,237,0.1)',
                            color: 'var(--ve-purple, #7C3AED)',
                          }}
                        >
                          Save ₹{savings.toLocaleString('en-IN')}
                        </span>
                      )}
                    </p>
                  )}
                  {duration === '12mo' && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.07)', borderRadius: 8, padding: '6px 10px' }}>
                      <Zap size={12} color="var(--ve-purple, #7C3AED)" />
                      <span style={{ fontSize: 11, color: 'var(--ve-purple, #7C3AED)', fontWeight: 700 }}>Pay Once. Train All Year.</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {cat.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <Check size={13} color={cat.color} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12, color: 'var(--ve-text-2, #5B4A8A)', lineHeight: 1.4 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/coaches" style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      width: '100%',
                      height: 44,
                      borderRadius: 12,
                      border: `1.5px solid ${cat.color}`,
                      background: cat.bg,
                      color: cat.color,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{ textAlign: 'center', marginTop: 28, padding: '20px', background: 'var(--ve-surface, #FFFFFF)', borderRadius: 16, border: '1px solid var(--ve-border, #E8E0FA)', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>
        <p style={{ fontSize: 14, color: 'var(--ve-text-3, #9B8EC4)', lineHeight: 1.6 }}>
          All plans include a <span style={{ color: 'var(--ve-text, #1A0A2E)', fontWeight: 600 }}>Vita Elite Verified</span> coach,
          session scheduling, progress tracking, and 24/7 WhatsApp support.
          <br />
          Cancel anytime. No long-term commitment required.
        </p>
      </div>
    </div>
  );
}
