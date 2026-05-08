'use client';

import { use } from 'react';
import Link from 'next/link';
import { Star, MapPin, Globe, CheckCircle, Clock, ChevronLeft } from 'lucide-react';
import CoachAvatar from '@/components/ui/CoachAvatar';
import StarRating from '@/components/ui/StarRating';
import { getCoachById } from '@/data/coaches';

const categoryMeta: Record<string, { label: string; color: string }> = {
  fitness: { label: 'Fitness', color: '#7C3AED' },
  diet: { label: 'Diet', color: '#F59E0B' },
  physio: { label: 'Physiotherapy', color: '#8B5CF6' },
};

const mockReviews = [
  { name: 'Anjali K.', date: 'April 2025', rating: 5, text: 'Absolutely life-changing. My coach was punctual, professional, and incredibly knowledgeable. Lost 8 kg in 3 months following the programme.' },
  { name: 'Ravi M.', date: 'March 2025', rating: 5, text: 'Best investment I have made in my health. The personalised approach and constant motivation made all the difference.' },
  { name: 'Sneha P.', date: 'February 2025', rating: 4, text: 'Very professional and knowledgeable. The sessions are well-structured and I have seen real progress in just 6 weeks.' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CoachProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const coach = getCoachById(Number(id));

  if (!coach) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ve-text-3)' }}>
        <p style={{ fontSize: 18, color: 'var(--ve-text)', marginBottom: 12 }}>Coach not found</p>
        <Link href="/coaches" style={{ color: 'var(--ve-purple)', textDecoration: 'none' }}>← Back to Coaches</Link>
      </div>
    );
  }

  const meta = categoryMeta[coach.category];
  const monthlyPrice = coach.price;
  const plans = [
    { duration: '1 Month', price: monthlyPrice, original: null, badge: null },
    { duration: '3 Months', price: Math.round(monthlyPrice * 0.9), original: monthlyPrice, savings: '10%', badge: 'Save 10%' },
    { duration: '6 Months', price: Math.round(monthlyPrice * 0.8), original: monthlyPrice, savings: '20%', badge: 'Save 20%' },
    { duration: '12 Months', price: Math.round(monthlyPrice * 0.65), original: monthlyPrice, savings: '35%', badge: 'Best Value' },
  ];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 0 120px' }}>
      {/* Back */}
      <div style={{ padding: '20px 20px 0' }}>
        <Link href="/coaches" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ve-text-3)', fontSize: 13 }}>
          <ChevronLeft size={14} /> Back to Coaches
        </Link>
      </div>

      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #F8F5FF 0%, #EDE9FE 100%)',
          padding: '28px 20px 24px',
          borderBottom: '1px solid var(--ve-border)',
        }}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <CoachAvatar name={coach.name} category={coach.category} size={80} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>{coach.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 10, lineHeight: 1.4 }}>{coach.designation}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 10,
                  background: `${meta.color}15`,
                  color: meta.color,
                  border: `1px solid ${meta.color}30`,
                }}
              >
                {meta.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={13} color="var(--ve-purple)" />
                <span style={{ fontSize: 11, color: 'var(--ve-purple)', fontWeight: 600 }}>Vita Elite Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} color="var(--ve-text-3)" />
                <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{coach.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginTop: 24,
            background: 'var(--ve-surface)',
            borderRadius: 14,
            padding: '16px 12px',
            border: '1px solid var(--ve-border)',
            boxShadow: '0 4px 24px rgba(124,58,237,0.10)',
          }}
        >
          {[
            { label: 'Rating', value: coach.rating.toString() },
            { label: 'Sessions', value: coach.sessions.toString() },
            { label: 'Experience', value: `${coach.experience} yrs` },
            { label: 'Languages', value: coach.languages.length.toString() },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ve-text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--ve-text-3)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Tagline */}
        <div
          style={{
            background: 'var(--ve-surface)',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 20,
            borderLeft: `3px solid ${meta.color}`,
            border: '1px solid var(--ve-border)',
            borderLeftWidth: 3,
            borderLeftColor: meta.color,
            boxShadow: '0 4px 24px rgba(124,58,237,0.10)',
          }}
        >
          <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--ve-text-2)' }}>&quot;{coach.tagline}&quot;</p>
        </div>

        {/* About */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 12 }}>About</h2>
          <p style={{ fontSize: 14, color: 'var(--ve-text-3)', lineHeight: 1.7 }}>{coach.bio}</p>
        </section>

        {/* Education */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 12 }}>Education</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={14} color="var(--ve-purple)" />
            <span style={{ fontSize: 13, color: 'var(--ve-text-2)' }}>{coach.education}</span>
          </div>
        </section>

        {/* Certifications */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 12 }}>Certifications</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {coach.certifications.map((cert) => (
              <span
                key={cert}
                style={{
                  fontSize: 11,
                  padding: '5px 11px',
                  borderRadius: 8,
                  background: 'var(--ve-bg)',
                  color: 'var(--ve-text-2)',
                  border: '1px solid var(--ve-border)',
                }}
              >
                {cert}
              </span>
            ))}
          </div>
        </section>

        {/* Specialisations */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 12 }}>Specialisations</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {coach.specialisations.map((spec) => (
              <span
                key={spec}
                style={{
                  fontSize: 11,
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: `${meta.color}12`,
                  color: meta.color,
                  border: `1px solid ${meta.color}30`,
                  fontWeight: 500,
                }}
              >
                {spec}
              </span>
            ))}
          </div>
        </section>

        {/* Languages */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 12 }}>Languages</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {coach.languages.map((lang) => (
              <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ve-bg)', borderRadius: 8, padding: '5px 11px', border: '1px solid var(--ve-border)' }}>
                <Globe size={11} color="var(--ve-text-3)" />
                <span style={{ fontSize: 12, color: 'var(--ve-text-2)' }}>{lang}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Availability */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 12 }}>Availability</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {DAYS.map((day) => {
              const available = coach.availability.includes(DAY_FULL[day]);
              return (
                <div
                  key={day}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px 0',
                    borderRadius: 8,
                    background: available ? 'rgba(124,58,237,0.10)' : 'var(--ve-bg)',
                    border: `1px solid ${available ? 'rgba(124,58,237,0.30)' : 'var(--ve-border)'}`,
                    color: available ? 'var(--ve-purple)' : 'var(--ve-text-3)',
                    fontSize: 11,
                    fontWeight: available ? 700 : 400,
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </section>

        {/* Reviews */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ve-text)' }}>Reviews</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ve-text)' }}>{coach.rating}</span>
              <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>({coach.sessions} reviews)</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mockReviews.map((review, i) => (
              <div key={i} style={{ background: 'var(--ve-surface)', borderRadius: 14, padding: '16px', border: '1px solid var(--ve-border)', boxShadow: '0 4px 24px rgba(124,58,237,0.10)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)' }}>{review.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--ve-text-3)', marginLeft: 8 }}>{review.date}</span>
                  </div>
                  <StarRating rating={review.rating} size={12} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--ve-text-3)', lineHeight: 1.6 }}>{review.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 8 }}>Pricing</h2>
          <div
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.30)',
              borderRadius: 12,
              padding: '10px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Clock size={14} color="#F59E0B" />
            <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>Trial: 1 Day Home Session — ₹100</span>
            <span style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>(logistics fee only)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plans.map((plan) => (
              <div
                key={plan.duration}
                style={{
                  background: 'var(--ve-surface)',
                  border: plan.badge === 'Best Value'
                    ? '1px solid rgba(124,58,237,0.40)'
                    : '1px solid var(--ve-border)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: plan.badge === 'Best Value' ? '0 4px 24px rgba(124,58,237,0.10)' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ve-text)' }}>{plan.duration}</span>
                    {plan.badge && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 8,
                          background: plan.badge === 'Best Value'
                            ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)'
                            : 'rgba(124,58,237,0.12)',
                          color: plan.badge === 'Best Value' ? '#FFFFFF' : 'var(--ve-purple)',
                        }}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  {plan.original && (
                    <span style={{ fontSize: 11, color: 'var(--ve-text-3)', textDecoration: 'line-through' }}>
                      ₹{plan.original.toLocaleString('en-IN')}/mo
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ve-text)' }}>
                    ₹{plan.price.toLocaleString('en-IN')}
                    <span style={{ fontSize: 12, color: 'var(--ve-text-3)', fontWeight: 400 }}>/mo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--ve-surface)',
          borderTop: '1px solid var(--ve-border)',
          padding: '14px 20px',
          display: 'flex',
          gap: 12,
          zIndex: 60,
          boxShadow: '0 -4px 24px rgba(124,58,237,0.08)',
        }}
        className="lg:ml-[240px]"
      >
        <Link href={`/book/${coach.id}?type=trial`} style={{ textDecoration: 'none', flex: 1 }}>
          <button className="btn-primary" style={{ width: '100%', fontSize: 14 }}>
            Book Trial — ₹100
          </button>
        </Link>
        <Link href={`/book/${coach.id}`} style={{ textDecoration: 'none', flex: 1 }}>
          <button className="btn-secondary" style={{ width: '100%', fontSize: 14 }}>
            Book Monthly Plan
          </button>
        </Link>
      </div>
    </div>
  );
}
