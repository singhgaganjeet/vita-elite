'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BMIZone {
  min: number;
  max: number;
  label: string;
  color: string;
}

const zones: BMIZone[] = [
  { min: 0, max: 18.5, label: 'Underweight', color: '#8B5CF6' },
  { min: 18.5, max: 25, label: 'Normal', color: '#10B981' },
  { min: 25, max: 30, label: 'Overweight', color: '#F59E0B' },
  { min: 30, max: 35, label: 'Obese', color: '#F97316' },
  { min: 35, max: 50, label: 'Severely Obese', color: '#EF4444' },
];

function getBMIZone(bmi: number) {
  return zones.find((z) => bmi >= z.min && bmi < z.max) ?? zones[zones.length - 1];
}

function getIdealWeight(heightCm: number) {
  const h = heightCm / 100;
  return {
    low: Math.round(18.5 * h * h * 10) / 10,
    high: Math.round(24.9 * h * h * 10) / 10,
  };
}

function getGaugePosition(bmi: number): number {
  const clampedBmi = Math.min(Math.max(bmi, 10), 45);
  return ((clampedBmi - 10) / (45 - 10)) * 100;
}

export default function BMIPage() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState('female');

  const bmi = weight / Math.pow(height / 100, 2);
  const zone = getBMIZone(bmi);
  const ideal = getIdealWeight(height);
  const gaugePos = getGaugePosition(bmi);

  const coachType = zone.label === 'Underweight' || zone.label === 'Normal' ? 'Fitness' : 'Diet';

  return (
    <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>BMI Calculator</h1>
      <p style={{ fontSize: 14, color: 'var(--ve-text-3)', marginBottom: 28 }}>
        Your Body Mass Index — calculated in real time
      </p>

      {/* Inputs */}
      <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 20, padding: '24px 20px', marginBottom: 20, boxShadow: '0 4px 24px rgba(124,58,237,0.10)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Height */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ fontSize: 13, color: 'var(--ve-text-3)' }}>Height</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  style={{
                    width: 64,
                    background: 'var(--ve-bg)',
                    border: '1px solid var(--ve-border)',
                    borderRadius: 8,
                    color: 'var(--ve-text)',
                    padding: '4px 8px',
                    fontSize: 14,
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>cm</span>
              </div>
            </div>
            <input type="range" min={100} max={220} value={height} onChange={(e) => setHeight(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#7C3AED', cursor: 'pointer' }} />
          </div>

          {/* Weight */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ fontSize: 13, color: 'var(--ve-text-3)' }}>Weight</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  style={{
                    width: 64,
                    background: 'var(--ve-bg)',
                    border: '1px solid var(--ve-border)',
                    borderRadius: 8,
                    color: 'var(--ve-text)',
                    padding: '4px 8px',
                    fontSize: 14,
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>kg</span>
              </div>
            </div>
            <input type="range" min={30} max={200} value={weight} onChange={(e) => setWeight(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#7C3AED', cursor: 'pointer' }} />
          </div>

          {/* Age + Sex */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--ve-text-3)', display: 'block', marginBottom: 6 }}>Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="input-field"
                style={{ textAlign: 'center' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--ve-text-3)', display: 'block', marginBottom: 6 }}>Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* BMI Result */}
      <div style={{ background: 'var(--ve-surface)', border: `1px solid ${zone.color}30`, borderRadius: 20, padding: '24px 20px', marginBottom: 20, boxShadow: `0 4px 24px ${zone.color}18` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--ve-text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Your BMI</p>
            <span style={{ fontSize: 64, fontWeight: 900, color: zone.color, lineHeight: 1 }}>
              {bmi.toFixed(1)}
            </span>
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: 24,
              background: `${zone.color}12`,
              border: `1px solid ${zone.color}35`,
              color: zone.color,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {zone.label}
          </div>
        </div>

        {/* Gauge */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              height: 16,
              borderRadius: 8,
              background: 'linear-gradient(to right, #8B5CF6 0%, #10B981 28%, #F59E0B 50%, #F97316 70%, #EF4444 100%)',
              position: 'relative',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${gaugePos}%`,
                transform: 'translate(-50%, -50%)',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#FFFFFF',
                border: `3px solid ${zone.color}`,
                boxShadow: `0 0 0 3px ${zone.color}30`,
                transition: 'left 0.4s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {['16', '18.5', '25', '30', '35', '40+'].map((v) => (
              <span key={v} style={{ fontSize: 9, color: 'var(--ve-text-3)' }}>{v}</span>
            ))}
          </div>
        </div>

        {/* Zone legend */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {zones.map((z) => (
            <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: z.color }} />
              <span style={{ fontSize: 10, color: 'var(--ve-text-3)' }}>{z.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ideal weight */}
      <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 16, padding: '18px 20px', marginBottom: 20, boxShadow: '0 4px 24px rgba(124,58,237,0.10)' }}>
        <p style={{ fontSize: 12, color: 'var(--ve-text-3)', marginBottom: 6 }}>Ideal Weight Range</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--ve-text)' }}>
          {ideal.low} – {ideal.high} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ve-text-3)' }}>kg</span>
        </p>
        <p style={{ fontSize: 12, color: 'var(--ve-text-3)', marginTop: 4 }}>
          Based on a healthy BMI range of 18.5–24.9 for your height
        </p>
      </div>

      {/* Personalised message */}
      <div
        style={{
          background: 'linear-gradient(135deg, #F8F5FF 0%, #EDE9FE 100%)',
          border: '1px solid var(--ve-border)',
          borderRadius: 20,
          padding: '20px',
          marginBottom: 20,
        }}
      >
        <p style={{ fontSize: 14, color: 'var(--ve-text-2)', lineHeight: 1.6, marginBottom: 14 }}>
          Your BMI suggests you are <span style={{ color: zone.color, fontWeight: 700 }}>{zone.label.toLowerCase()}</span>.
          {zone.label === 'Normal' ? ' Keep up the great work and maintain your healthy lifestyle.' :
            zone.label === 'Underweight' ? ' Consider working with a fitness and nutrition coach to build healthy weight.' :
            ' A Vita Elite coach can help you achieve a healthier BMI through personalised guidance.'}
        </p>
        <Link href="/coaches" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 20px' }}>
            Book a {coachType} Coach <ChevronRight size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
}
