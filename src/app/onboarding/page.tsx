'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Dumbbell, Apple, Wrench, Zap } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';

type Goal =
  | 'Weight Loss'
  | 'Weight Gain'
  | 'Build Strength'
  | 'Improve Flexibility'
  | 'Disease Management'
  | 'Injury Recovery'
  | 'General Wellness';

const ALL_GOALS: Goal[] = [
  'Weight Loss',
  'Weight Gain',
  'Build Strength',
  'Improve Flexibility',
  'Disease Management',
  'Injury Recovery',
  'General Wellness',
];

function getBMIInfo(bmi: number): { category: string; color: string } {
  if (bmi < 18.5) return { category: 'Underweight', color: '#3B82F6' };
  if (bmi < 25) return { category: 'Normal weight', color: '#22C55E' };
  if (bmi < 30) return { category: 'Overweight', color: '#F5C518' };
  if (bmi < 35) return { category: 'Obese', color: '#F97316' };
  return { category: 'Severely Obese', color: '#EF4444' };
}

export default function OnboardingPage() {
  const router = useRouter();
  const setProfile = useUserStore((s) => s.setProfile);
  const addMeasurement = useUserStore((s) => s.addMeasurement);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'prefer-not-to-say'>('female');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalSteps = 5;
  const bmi = weight / Math.pow(height / 100, 2);
  const bmiInfo = getBMIInfo(bmi);

  const toggleGoal = (g: Goal) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const handleStep2Next = () => {
    setProfile({
      name: name.trim() || 'User',
      age: parseInt(age) || 25,
      sex,
      city: city.trim(),
      state: stateVal.trim(),
    });
    setStep(3);
  };

  const handleStep3Next = () => {
    setProfile({ weight, height });
    addMeasurement('weight', weight);
    addMeasurement('height', height);
    setStep(4);
  };

  const handleStep4Next = () => {
    setProfile({ goals });
    setStep(5);
  };

  const handleFinish = () => {
    setProfile({ onboardingComplete: true });
    router.push('/dashboard');
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
      }}
    >
      {/* Grid bg */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(46,46,46,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(46,46,46,0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.4,
        }}
      />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
        {/* Progress bar */}
        {step > 1 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#A0A0A0' }}>Step {step - 1} of {totalSteps - 1}</span>
              <span style={{ fontSize: 12, color: '#22C55E' }}>{Math.round(((step - 1) / (totalSteps - 1)) * 100)}%</span>
            </div>
            <div style={{ height: 4, background: '#2E2E2E', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 2,
                  background: '#22C55E',
                  width: `${((step - 1) / (totalSteps - 1)) * 100}%`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
            className="animate-fade-in-up"
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse-green 2s ease-in-out infinite',
                }}
              >
                <Dumbbell size={36} color="#22C55E" />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-1.5px' }}>VITA</span>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#22C55E', letterSpacing: '-1.5px' }}>ELITE</span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px', marginBottom: 12 }}>
                Let&apos;s build your health profile
              </h1>
              <p style={{ fontSize: 15, color: '#A0A0A0', lineHeight: 1.6, maxWidth: 380 }}>
                Answer a few quick questions so we can personalise your Vita Elite experience.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn-primary"
              style={{ width: '100%', maxWidth: 320, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Get Started <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="animate-fade-in-up" style={{ background: '#1A1A1A', borderRadius: 24, border: '1px solid #2E2E2E', padding: '36px 32px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>Basic Info</h2>
            <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 28 }}>Tell us a bit about yourself</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input className="input-field" placeholder="Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>Age</label>
                  <input className="input-field" type="number" placeholder="28" value={age} onChange={(e) => setAge(e.target.value)} />
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
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>City</label>
                  <input className="input-field" placeholder="Mumbai" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#A0A0A0', display: 'block', marginBottom: 6 }}>State</label>
                  <input className="input-field" placeholder="Maharashtra" value={stateVal} onChange={(e) => setStateVal(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={handleStep2Next} className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Body Metrics */}
        {step === 3 && (
          <div className="animate-fade-in-up" style={{ background: '#1A1A1A', borderRadius: 24, border: '1px solid #2E2E2E', padding: '36px 32px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>Body Metrics</h2>
            <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 28 }}>Used to calculate your BMI and calorie goal</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 13, color: '#A0A0A0' }}>Weight</label>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{weight} <span style={{ fontSize: 12, color: '#A0A0A0' }}>kg</span></span>
                </div>
                <input
                  type="range" min={30} max={200} value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#22C55E', cursor: 'pointer', height: 6 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#555' }}>30 kg</span>
                  <span style={{ fontSize: 11, color: '#555' }}>200 kg</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 13, color: '#A0A0A0' }}>Height</label>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{height} <span style={{ fontSize: 12, color: '#A0A0A0' }}>cm</span></span>
                </div>
                <input
                  type="range" min={100} max={220} value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#22C55E', cursor: 'pointer', height: 6 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#555' }}>100 cm</span>
                  <span style={{ fontSize: 11, color: '#555' }}>220 cm</span>
                </div>
              </div>

              {/* Live BMI */}
              <div
                style={{
                  background: '#242424',
                  borderRadius: 16,
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: `1px solid ${bmiInfo.color}30`,
                }}
              >
                <div>
                  <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 4 }}>Your BMI</p>
                  <span style={{ fontSize: 42, fontWeight: 900, color: bmiInfo.color, lineHeight: 1 }}>
                    {bmi.toFixed(1)}
                  </span>
                </div>
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    background: `${bmiInfo.color}18`,
                    border: `1px solid ${bmiInfo.color}40`,
                    color: bmiInfo.color,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {bmiInfo.category}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={handleStep3Next} className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Health Goals */}
        {step === 4 && (
          <div className="animate-fade-in-up" style={{ background: '#1A1A1A', borderRadius: 24, border: '1px solid #2E2E2E', padding: '36px 32px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>Health Goals</h2>
            <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 28 }}>Select all that apply</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {ALL_GOALS.map((g) => {
                const selected = goals.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGoal(g)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 24,
                      border: `1.5px solid ${selected ? '#22C55E' : '#2E2E2E'}`,
                      background: selected ? 'rgba(34,197,94,0.15)' : '#242424',
                      color: selected ? '#22C55E' : '#A0A0A0',
                      fontSize: 13,
                      fontWeight: selected ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setStep(3)} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={handleStep4Next} className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Feature Walkthrough */}
        {step === 5 && (
          <div className="animate-fade-in-up">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>
                You&apos;re all set! 🎉
              </h2>
              <p style={{ fontSize: 15, color: '#A0A0A0' }}>
                Here&apos;s what&apos;s waiting for you inside Vita Elite
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {[
                { icon: <Dumbbell size={22} color="#22C55E" />, title: 'Coach Booking', desc: 'Book certified coaches, dietitians & physios. First consult just ₹100.', color: '#22C55E' },
                { icon: <Apple size={22} color="#F5C518" />, title: 'Calorie Tracker', desc: 'Log meals, scan barcodes, track macros with Open Food Facts.', color: '#F5C518' },
                { icon: <Wrench size={22} color="#3B82F6" />, title: 'Health Tools', desc: 'BMI calculator, food scanner, and label analyser — all free.', color: '#3B82F6' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    background: '#1A1A1A',
                    border: '1px solid #2E2E2E',
                    borderRadius: 16,
                    padding: '18px 20px',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${item.color}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: '#A0A0A0', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="btn-primary"
              style={{ width: '100%', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Start Exploring <Zap size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
