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
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#A0A0A0' }}>Coach not found</p>
        <Link href="/coaches" style={{ color: '#22C55E', textDecoration: 'none' }}>Back to Coaches</Link>
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
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '24px 20px 40px' }}>
      {/* Header */}
      {step < 7 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as BookingStep)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0A0A0', padding: 0 }}
              >
                <ChevronLeft size={20} />
              </button>
            ) : (
              <Link href={`/coaches/${coach.id}`} style={{ color: '#A0A0A0' }}>
                <ChevronLeft size={20} />
              </Link>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 2 }}>{stepTitles[step]}</h1>
              <p style={{ fontSize: 12, color: '#A0A0A0' }}>Step {step} of {stepCount}</p>
            </div>
          </div>
          <div style={{ height: 4, background: '#2E2E2E', borderRadius: 2, marginBottom: 28, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / stepCount) * 100}%`, background: '#22C55E', borderRadius: 2, transition: 'width 0.3s ease' }} />
          </div>
        </>
      )}

      {/* Coach summary strip */}
      {step < 7 && (
        <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <CoachAvatar name={coach.name} category={coach.category} size={40} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{coach.name}</p>
            <p style={{ fontSize: 11, color: '#A0A0A0' }}>{coach.city}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#22C55E' }}>₹{finalPrice.toLocaleString('en-IN')}</p>
            <p style={{ fontSize: 10, color: '#A0A0A0' }}>{selectedService.key === 'trial' ? 'one-time' : '/month'}</p>
          </div>
        </div>
      )}

      {/* Step 1: Service selection */}
      {step === 1 && (
        <div className="animate-fade-in-up">
          <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 16 }}>What type of session are you looking for?</p>
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
                    border: `2px solid ${active ? '#22C55E' : '#2E2E2E'}`,
                    background: active ? 'rgba(34,197,94,0.1)' : '#1A1A1A',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>{s.label}</p>
                    <p style={{ fontSize: 12, color: '#A0A0A0' }}>{s.duration}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: active ? '#22C55E' : '#FFFFFF' }}>₹{price.toLocaleString('en-IN')}</p>
                    {key === 'trial' && <p style={{ fontSize: 10, color: '#A0A0A0' }}>logistics fee</p>}
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
          <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 16 }}>How long would you like to train?</p>
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
                    border: `2px solid ${active ? '#22C55E' : '#2E2E2E'}`,
                    background: active ? 'rgba(34,197,94,0.1)' : '#1A1A1A',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? '#22C55E' : '#2E2E2E'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{s.label}</p>
                      <p style={{ fontSize: 11, color: '#A0A0A0' }}>{s.duration}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: active ? '#22C55E' : '#FFFFFF' }}>₹{price.toLocaleString('en-IN')}</p>
                    {s.savings && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#F5C518', background: 'rgba(245,197,24,0.15)', padding: '1px 6px', borderRadius: 6 }}>{s.savings}</span>
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
          <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} /> Your session address
          </p>
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {[
              { key: 'house', label: 'House / Flat No.', placeholder: 'Flat 402, Block B' },
              { key: 'street', label: 'Street / Locality', placeholder: 'Andheri West' },
              { key: 'city', label: 'City', placeholder: 'Mumbai' },
              { key: 'state', label: 'State', placeholder: 'Maharashtra' },
              { key: 'pincode', label: 'Pincode', placeholder: '400053' },
            ].map((field) => (
              <div key={field.key}>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>{field.label}</label>
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
          <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
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
                  border: `1.5px solid ${booking.selectedDate === d.date ? '#22C55E' : '#2E2E2E'}`,
                  background: booking.selectedDate === d.date ? 'rgba(34,197,94,0.15)' : '#1A1A1A',
                  color: booking.selectedDate === d.date ? '#22C55E' : '#A0A0A0',
                  fontSize: 12,
                  fontWeight: booking.selectedDate === d.date ? 700 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
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
                  border: `1.5px solid ${booking.selectedTime === time ? '#22C55E' : '#2E2E2E'}`,
                  background: booking.selectedTime === time ? 'rgba(34,197,94,0.15)' : '#1A1A1A',
                  color: booking.selectedTime === time ? '#22C55E' : '#E0E0E0',
                  fontSize: 12,
                  fontWeight: booking.selectedTime === time ? 700 : 400,
                  cursor: 'pointer',
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
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, fontWeight: 700 }}>Booking Summary</p>
            {[
              { label: 'Coach', value: coach.name },
              { label: 'Category', value: coach.category.charAt(0).toUpperCase() + coach.category.slice(1) },
              { label: 'Service', value: selectedService.label },
              { label: 'Duration', value: selectedService.duration },
              { label: 'Date', value: booking.selectedDate || '—' },
              { label: 'Time', value: booking.selectedTime || '—' },
              { label: 'Address', value: `${booking.address.house}, ${booking.address.street}, ${booking.address.city}` },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2E2E2E' }}>
                <span style={{ fontSize: 13, color: '#A0A0A0' }}>{row.label}</span>
                <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#22C55E' }}>₹{finalPrice.toLocaleString('en-IN')}</span>
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
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 16, padding: '20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: '#A0A0A0' }}>Amount to pay</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#22C55E' }}>₹{finalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#242424', borderRadius: 10, padding: '10px 14px' }}>
              <CreditCard size={14} color="#A0A0A0" />
              <span style={{ fontSize: 12, color: '#A0A0A0' }}>Secure payment powered by Razorpay</span>
            </div>
          </div>
          <button
            onClick={() => setStep(7)}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #1A3FFF, #3060FF)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
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
              background: 'rgba(34,197,94,0.15)',
              border: '2px solid rgba(34,197,94,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'pulse-green 2s ease-in-out infinite',
            }}
          >
            <Check size={36} color="#22C55E" strokeWidth={3} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF', marginBottom: 8 }}>Booking Confirmed!</h2>
          <p style={{ fontSize: 15, color: '#A0A0A0', marginBottom: 28 }}>
            Your session with {coach.name} has been booked. You&apos;ll receive a confirmation on WhatsApp.
          </p>
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 16, padding: '20px', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ fontSize: 12, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, fontWeight: 700 }}>Booking Details</p>
            {[
              { label: 'Booking ID', value: `#VE${Date.now().toString().slice(-6)}` },
              { label: 'Coach', value: coach.name },
              { label: 'Session', value: selectedService.label },
              { label: 'Date & Time', value: `${booking.selectedDate} at ${booking.selectedTime}` },
              { label: 'Amount Paid', value: `₹${finalPrice.toLocaleString('en-IN')}` },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #2E2E2E' }}>
                <span style={{ fontSize: 12, color: '#A0A0A0' }}>{row.label}</span>
                <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600 }}>{row.value}</span>
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
