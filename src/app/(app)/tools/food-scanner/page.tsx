'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, Plus, ScanLine, ChevronDown } from 'lucide-react';

const DEMO_RESULT = {
  name: 'Dal Makhani',
  confidence: 94,
  calories: 198,
  protein: 9,
  carbs: 24,
  fats: 8,
  fibre: 5,
  sodium: 480,
  servingSize: '1 bowl (200g)',
};

type Meal = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
const MEALS: Meal[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export default function FoodScannerPage() {
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal>('Lunch');
  const [added, setAdded] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 2000);
  };

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Food Scanner</h1>
      <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 24 }}>
        Point at any dish to get instant nutrition breakdown
      </p>

      {/* Camera UI */}
      <div
        style={{
          background: '#111',
          border: '1px solid #2E2E2E',
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 20,
          aspectRatio: '4/3',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Fake camera view */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #0D1A0D 0%, #0A0A0A 50%, #1A0D0D 100%)',
          }}
        />

        {/* Scanning frame */}
        <div
          style={{
            position: 'absolute',
            width: '60%',
            aspectRatio: '1',
            border: `2px dashed ${scanning ? '#22C55E' : 'rgba(255,255,255,0.3)'}`,
            borderRadius: 16,
            transition: 'border-color 0.3s',
          }}
        >
          {/* Corner accents */}
          {['tl', 'tr', 'bl', 'br'].map((corner) => (
            <div
              key={corner}
              style={{
                position: 'absolute',
                width: 20,
                height: 20,
                borderColor: '#22C55E',
                borderStyle: 'solid',
                borderWidth: 0,
                ...(corner === 'tl' ? { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderRadius: '4px 0 0 0' } :
                   corner === 'tr' ? { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderRadius: '0 4px 0 0' } :
                   corner === 'bl' ? { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: '0 0 0 4px' } :
                   { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderRadius: '0 0 4px 0' }),
              }}
            />
          ))}
        </div>

        {/* Scanning animation */}
        {scanning && (
          <div
            style={{
              position: 'absolute',
              left: '20%',
              right: '20%',
              height: 2,
              background: '#22C55E',
              boxShadow: '0 0 8px #22C55E, 0 0 20px rgba(34,197,94,0.5)',
              animation: 'scan 1s ease-in-out infinite alternate',
              zIndex: 2,
            }}
          />
        )}

        {/* Demo food image placeholder */}
        {!scanning && !scanned && (
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Camera size={28} color="#22C55E" />
            </div>
            <p style={{ fontSize: 13, color: '#A0A0A0' }}>Demo mode — tap to scan</p>
          </div>
        )}

        {scanned && (
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🍛</div>
            <div
              style={{
                background: 'rgba(34,197,94,0.9)',
                borderRadius: 8,
                padding: '4px 12px',
                marginTop: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>Identified!</span>
            </div>
          </div>
        )}

        {/* Bottom status bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            padding: '24px 16px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!scanned ? (
            <button
              onClick={handleScan}
              disabled={scanning}
              style={{
                background: scanning ? '#2E2E2E' : '#22C55E',
                border: 'none',
                borderRadius: 24,
                padding: '10px 28px',
                color: '#000',
                fontSize: 14,
                fontWeight: 700,
                cursor: scanning ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <ScanLine size={16} color={scanning ? '#A0A0A0' : '#000'} />
              {scanning ? 'Scanning...' : 'Scan Demo'}
            </button>
          ) : (
            <button
              onClick={() => setScanned(false)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 20,
                padding: '8px 20px',
                color: '#FFFFFF',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Scan Again
            </button>
          )}
        </div>

        <style>{`
          @keyframes scan {
            from { top: 20%; }
            to { top: 80%; }
          }
        `}</style>
      </div>

      {/* Result card */}
      {scanned && (
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2E2E2E',
            borderRadius: 20,
            padding: '20px',
            marginBottom: 20,
            animation: 'fadeInUp 0.4s ease forwards',
          }}
          className="animate-fade-in-up"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>{DEMO_RESULT.name}</h3>
              <p style={{ fontSize: 12, color: '#A0A0A0' }}>{DEMO_RESULT.servingSize}</p>
            </div>
            <div
              style={{
                padding: '4px 10px',
                borderRadius: 10,
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#22C55E' }}>{DEMO_RESULT.confidence}% confident</span>
            </div>
          </div>

          {/* Calories */}
          <div style={{ textAlign: 'center', background: '#242424', borderRadius: 14, padding: '16px', marginBottom: 16 }}>
            <span style={{ fontSize: 42, fontWeight: 900, color: '#22C55E', lineHeight: 1 }}>
              {DEMO_RESULT.calories}
            </span>
            <span style={{ fontSize: 14, color: '#A0A0A0', marginLeft: 4 }}>kcal</span>
          </div>

          {/* Macro grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Protein', value: DEMO_RESULT.protein, unit: 'g', color: '#22C55E' },
              { label: 'Carbs', value: DEMO_RESULT.carbs, unit: 'g', color: '#F5C518' },
              { label: 'Fats', value: DEMO_RESULT.fats, unit: 'g', color: '#F97316' },
            ].map((m) => (
              <div key={m.label} style={{ background: '#242424', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}<span style={{ fontSize: 11, color: '#A0A0A0' }}>{m.unit}</span></div>
                <div style={{ fontSize: 10, color: '#A0A0A0', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Fibre', value: DEMO_RESULT.fibre, unit: 'g', color: '#8B5CF6' },
              { label: 'Sodium', value: DEMO_RESULT.sodium, unit: 'mg', color: '#EC4899' },
            ].map((m) => (
              <div key={m.label} style={{ background: '#242424', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}<span style={{ fontSize: 11, color: '#A0A0A0' }}>{m.unit}</span></div>
                <div style={{ fontSize: 10, color: '#A0A0A0', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Add to meal */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value as Meal)}
                className="input-field"
                style={{ cursor: 'pointer', paddingRight: 32 }}
              >
                {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={14} color="#A0A0A0" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
            <button
              onClick={handleAdd}
              className="btn-primary"
              style={{ flexShrink: 0, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {added ? '✓ Added!' : <><Plus size={16} /> Add</>}
            </button>
          </div>
          <p style={{ textAlign: 'center', marginTop: 12 }}>
            <Link href="/nutrition" style={{ fontSize: 12, color: '#22C55E', textDecoration: 'none' }}>
              Or search manually in Nutrition tracker →
            </Link>
          </p>
        </div>
      )}

      {/* Info card */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 16, padding: '16px 18px' }}>
        <p style={{ fontSize: 12, color: '#A0A0A0', lineHeight: 1.6 }}>
          🤖 <strong style={{ color: '#FFFFFF' }}>AI Food Recognition</strong> — This demo uses a pre-loaded database of Indian foods.
          In the full app, the camera API will identify dishes in real-time with high accuracy.
        </p>
      </div>
    </div>
  );
}
