'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Check, MapPin, Clock, CreditCard } from 'lucide-react';
import CoachAvatar from '@/components/ui/CoachAvatar';
import { getCoachById } from '@/data/coaches';

type ServiceType = 'trial' | 'monthly' | '3month' | '6month' | '12month';
type BookingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface BookingState {
  service: ServiceType;
  address: { house: string; street: string; city: string; state: string; pincode: string };
  selectedDate: string;
  selectedTime: string;
}

const serviceOptions: { key: ServiceType; label: string; duration: string; price: (base: number) => number; savings?: string }[] = [
  { key: 'trial', label: '1-Day Trial', duration: '1 session', price: () => 100 },
  { key: 'monthly', label: '1 Month', duration: '4 sessions/month', price: (b) => b },
  { key: '3month', label: '3 Months', duration: '12 sessions', price: (b) => Math.round(b * 0.9), savings: 'Save 10%' },
  { key: '6month', label: '6 Months', duration: '24 sessions', price: (b) => Math.round(b * 0.8), savings: 'Save 20%' },
  { key: '12month', label: '12 Months', duration: '48 sessions', price: (b) => Math.round(b * 0.65), savings: 'Save 35%' },
];

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

function getNext7Days() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  }
  return days;
}

interface PageProps {
  params: Promise<{ coachId: string }>;
}

export default function BookingPage({ params }: PageProps) {
  const { coachId } = use(params);
  const coach = getCoachById(Number(coachId));
  const [step, setStep] = useState<BookingStep>(1);
  const [booking, setBooking] = useState<BookingState>({
    service: 'trial',
    address: { house: '', street: '', city: '', state: '', pincode: '' },
    selectedDate: '',
    selectedTime: '',
  });

  const days = getNext7Days();

  if (!coach) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--ve-bg, #F8F5FF)', minHeight: '100vh' }}>
        <p style={{ color: 'var(--ve-text-3, #9B8EC4)' }}>Coach not found</p>
        <Link href="/coaches" style={{ color: 'var(--ve-purple, #7C3AED)', textDecoration: 'none' }}>Back to Coaches</Link>
      </div>
    );
  }

  const selectedService = serviceOptions.find((s) => s.key === booking.service)!;
  const finalPrice = selectedService.price(coach.price);

  const stepTitles: Record<BookingStep, string> = {
    1: 'Select Service',
    2: 'Choose Duration',
    3: 'Your Address',
    4: 'Pick Time Slot',
    5: 'Review Booking',
    6: 'Payment',
    7: 'Booking Confirmed',
  };

  const stepCount = 6;

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 20px 40px', background: 'var(--ve-bg, #F8F5FF)', minHeight: '100vh' }}>
      {/* Header */}
      {step < 7 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as BookingStep)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ve-text-3, #9B8EC4)', padding: 0 }}
              >
                <ChevronLeft size={20} />
              </button>
            ) : (
              <Link href={`/coaches/${coach.id}`} style={{ color: 'var(--ve-text-3, #9B8EC4)' }}>
                <ChevronLeft size={20} />
              </Link>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ve-text, #1A0A2E)', marginBottom: 2 }}>{stepTitles[step]}</h1>
              <p style={{ fontSize: 12, color: 'var(--ve-text-3, #9B8EC4)' }}>Step {step} of {stepCount}</p>
            </div>
          </div>
          <div style={{ height: 4, background: 'var(--ve-border, #E8E0FA)', borderRadius: 2, marginBottom: 28, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / stepCount) * 100}%`, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', borderRadius: 2, transition: 'width 0.3s ease' }} />
          </div>
        </>
      )}

      {/* Coach summary strip */}
      {step < 7 && (
        <div style={{ background: 'var(--ve-surface, #FFFFFF)', border: '1px solid var(--ve-border, #E8E0FA)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px rgba(124,58,237,0.07)' }}>
          <CoachAvatar name={coach.name} category={coach.category} size={40} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ve-text, #1A0A2E)' }}>{coach.name}</p>
            <p style={{ fontSize: 11, color: 'var(--ve-text-3, #9B8EC4)' }}>{coach.city}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--ve-purple, #7C3AED)' }}>₹{finalPrice.toLocaleString('en-IN')}</p>
            <p style={{ fontSize: 10, color: 'var(--ve-text-3, #9B8EC4)' }}>{selectedService.key === 'trial' ? 'one-time' : '/month'}</p>
          </div>
        </div>
      )}

      {/* Step 1: Service selection */}
      {step === 1 && (
        <div className="animate-fade-in-up">
          <p style={{ fontSize: 13, color: 'var(--ve-text-3, #9B8EC4)', marginBottom: 16 }}>What type of session are you looking for?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {(['trial', 'monthly'] as ServiceType[]).map((key) => {
              const s = serviceOptions.find((o) => o.key === key)!;
              const price = s.price(coach.price);
              const active = booking.service === key;
              return (
                <div
                  key={key}
                  onClick={() => setBooking((p) => ({ ...p, service: key }))}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: `2px solid ${active ? '#7C3AED' : 'var(--ve-border, #E8E0FA)'}`,
                    background: active ? 'rgba(124,58,237,0.06)' : 'var(--ve-surface, #FFFFFF)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: active ? '0 4px 16px rgba(124,58,237,0.12)' : '0 1px 4px rgba(124,58,237,0.04)',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text, #1A0A2E)', marginBottom: 2 }}>{s.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--ve-text-3, #9B8EC4)' }}>{s.duration}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: active ? 'var(--ve-purple, #7C3AED)' : 'var(--ve-text, #1A0A2E)' }}>₹{price.toLocaleString('en-IN')}</p>
                    {key === 'trial' && <p style={{ fontSize: 10, color: 'var(--ve-text-3, #9B8EC4)' }}>logistics fee</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => setStep(2)} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Duration */}
      {step === 2 && (
        <div className="animate-fade-in-up">
          <p style={{ fontSize: 13, color: 'var(--ve-text-3, #9B8EC4)', marginBottom: 16 }}>How long would you like to train?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {serviceOptions.map((s) => {
              const price = s.price(coach.price);
              const active = booking.service === s.key;
              return (
                <div
                  key={s.key}
                  onClick={() => setBooking((p) => ({ ...p, service: s.key }))}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 14,
                    border: `2px solid ${active ? '#7C3AED' : 'var(--ve-border, #E8E0FA)'}`,
                    background: active ? 'rgba(124,58,237,0.06)' : 'var(--ve-surface, #FFFFFF)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: active ? '0 4px 16px rgba(124,58,237,0.12)' : '0 1px 4px rgba(124,58,237,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? '#7C3AED' : 'var(--ve-border, #E8E0FA)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED' }} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text, #1A0A2E)' }}>{s.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--ve-text-3, #9B8EC4)' }}>{s.duration}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: active ? 'var(--ve-purple, #7C3AED)' : 'var(--ve-text, #1A0A2E)' }}>₹{price.toLocaleString('en-IN')}</p>
                    {s.savings && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ve-purple, #7C3AED)', background: 'rgba(124,58,237,0.1)', padding: '1px 6px', borderRadius: 6 }}>{s.savings}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => setStep(3)} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 3: Address */}
      {step === 3 && (
        <div className="animate-fade-in-up">
          <p style={{ fontSize: 13, color: 'var(--ve-text-3, #9B8EC4)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} /> Your session address
          </p>
          <div style={{ background: 'var(--ve-surface, #FFFFFF)', border: '1px solid var(--ve-border, #E8E0FA)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24, boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}>
            {[
              { key: 'house', label: 'House / Flat No.', placeholder: 'Flat 402, Block B' },
              { key: 'street', label: 'Street / Locality', placeholder: 'Andheri West' },
              { key: 'city', label: 'City', placeholder: 'Mumbai' },
              { key: 'state', label: 'State', placeholder: 'Maharashtra' },
              { key: 'pincode', label: 'Pincode', placeholder: '400053' },
            ].map((field) => (
              <div key={field.key}>
                <label style={{ fontSize: 12, color: 'var(--ve-text-2, #5B4A8A)', display: 'block', marginBottom: 6 }}>{field.label}</label>
                <input
                  className="input-field"
                  placeholder={field.placeholder}
                  value={booking.address[field.key as keyof typeof booking.address]}
                  onChange={(e) => setBooking((p) => ({ ...p, address: { ...p.address, [field.key]: e.target.value } }))}
                />
              </div>
            ))}
          </div>
          <button onClick={() => setStep(4)} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 4: Time slot */}
      {step === 4 && (
        <div className="animate-fade-in-up">
          <p style={{ fontSize: 13, color: 'var(--ve-text-3, #9B8EC4)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> Choose your preferred session time
          </p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
            {days.map((d) => (
              <button
                key={d.date}
                onClick={() => setBooking((p) => ({ ...p, selectedDate: d.date }))}
                style={{
                  flexShrink: 0,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: `1.5px solid ${booking.selectedDate === d.date ? '#7C3AED' : 'var(--ve-border, #E8E0FA)'}`,
                  background: booking.selectedDate === d.date ? 'rgba(124,58,237,0.08)' : 'var(--ve-surface, #FFFFFF)',
                  color: booking.selectedDate === d.date ? 'var(--ve-purple, #7C3AED)' : 'var(--ve-text-3, #9B8EC4)',
                  fontSize: 12,
                  fontWeight: booking.selectedDate === d.date ? 700 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: booking.selectedDate === d.date ? '0 2px 10px rgba(124,58,237,0.12)' : 'none',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}>
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                onClick={() => setBooking((p) => ({ ...p, selectedTime: time }))}
                style={{
                  padding: '12px 8px',
                  borderRadius: 10,
                  border: `1.5px solid ${booking.selectedTime === time ? '#7C3AED' : 'var(--ve-border, #E8E0FA)'}`,
                  background: booking.selectedTime === time ? 'rgba(124,58,237,0.08)' : 'var(--ve-surface, #FFFFFF)',
                  color: booking.selectedTime === time ? 'var(--ve-purple, #7C3AED)' : 'var(--ve-text-2, #5B4A8A)',
                  fontSize: 12,
                  fontWeight: booking.selectedTime === time ? 700 : 400,
                  cursor: 'pointer',
                  boxShadow: booking.selectedTime === time ? '0 2px 8px rgba(124,58,237,0.12)' : 'none',
                }}
              >
                {time}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(5)}
            disabled={!booking.selectedDate || !booking.selectedTime}
            className="btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: (!booking.selectedDate || !booking.selectedTime) ? 0.4 : 1 }}
          >
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="animate-fade-in-up">
          <div style={{ background: 'var(--ve-surface, #FFFFFF)', border: '1px solid var(--ve-border, #E8E0FA)', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(124,58,237,0.07)' }}>
            <p style={{ fontSize: 12, color: 'var(--ve-text-3, #9B8EC4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, fontWeight: 700 }}>Booking Summary</p>
            {[
              { label: 'Coach', value: coach.name },
              { label: 'Category', value: coach.category.charAt(0).toUpperCase() + coach.category.slice(1) },
              { label: 'Service', value: selectedService.label },
              { label: 'Duration', value: selectedService.duration },
              { label: 'Date', value: booking.selectedDate || '—' },
              { label: 'Time', value: booking.selectedTime || '—' },
              { label: 'Address', value: `${booking.address.house}, ${booking.address.street}, ${booking.address.city}` },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--ve-border, #E8E0FA)' }}>
                <span style={{ fontSize: 13, color: 'var(--ve-text-3, #9B8EC4)' }}>{row.label}</span>
                <span style={{ fontSize: 13, color: 'var(--ve-text, #1A0A2E)', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ve-text, #1A0A2E)' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--ve-purple, #7C3AED)' }}>₹{finalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button onClick={() => setStep(6)} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Proceed to Payment <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 6: Payment */}
      {step === 6 && (
        <div className="animate-fade-in-up">
          <div style={{ background: 'var(--ve-surface, #FFFFFF)', border: '1px solid var(--ve-border, #E8E0FA)', borderRadius: 16, padding: '20px', marginBottom: 20, boxShadow: '0 2px 12px rgba(124,58,237,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: 'var(--ve-text-3, #9B8EC4)' }}>Amount to pay</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--ve-purple, #7C3AED)' }}>₹{finalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ve-surface-2, #F3F0FF)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--ve-border, #E8E0FA)' }}>
              <CreditCard size={14} color="var(--ve-text-3, #9B8EC4)" />
              <span style={{ fontSize: 12, color: 'var(--ve-text-3, #9B8EC4)' }}>Secure payment powered by Razorpay</span>
            </div>
          </div>
          <button
            onClick={() => setStep(7)}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #7C3AED, #A855F7, #EC4899)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 4px 20px rgba(124,58,237,0.30)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Pay ₹{finalPrice.toLocaleString('en-IN')} via Razorpay
          </button>
        </div>
      )}

      {/* Step 7: Confirmed */}
      {step === 7 && (
        <div className="animate-fade-in-up" style={{ textAlign: 'center', paddingTop: 20 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(124,58,237,0.10)',
              border: '2px solid rgba(124,58,237,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Check size={36} color="#7C3AED" strokeWidth={3} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--ve-text, #1A0A2E)', marginBottom: 8 }}>Booking Confirmed!</h2>
          <p style={{ fontSize: 15, color: 'var(--ve-text-3, #9B8EC4)', marginBottom: 28 }}>
            Your session with {coach.name} has been booked. You&apos;ll receive a confirmation on WhatsApp.
          </p>
          <div style={{ background: 'var(--ve-surface, #FFFFFF)', border: '1px solid var(--ve-border, #E8E0FA)', borderRadius: 16, padding: '20px', marginBottom: 24, textAlign: 'left', boxShadow: '0 2px 12px rgba(124,58,237,0.07)' }}>
            <p style={{ fontSize: 12, color: 'var(--ve-text-3, #9B8EC4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, fontWeight: 700 }}>Booking Details</p>
            {[
              { label: 'Booking ID', value: `#VE${Date.now().toString().slice(-6)}` },
              { label: 'Coach', value: coach.name },
              { label: 'Session', value: selectedService.label },
              { label: 'Date & Time', value: `${booking.selectedDate} at ${booking.selectedTime}` },
              { label: 'Amount Paid', value: `₹${finalPrice.toLocaleString('en-IN')}` },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--ve-border, #E8E0FA)' }}>
                <span style={{ fontSize: 12, color: 'var(--ve-text-3, #9B8EC4)' }}>{row.label}</span>
                <span style={{ fontSize: 12, color: 'var(--ve-text, #1A0A2E)', fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ width: '100%' }}>Back to Dashboard</button>
          </Link>
        </div>
      )}
    </div>
  );
}
