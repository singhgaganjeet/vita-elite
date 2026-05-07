'use client';

import { useState } from 'react';
import { ScanLine, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const DEMO_LABEL = {
  product: 'Maggi 2-Minute Noodles',
  servingSize: '70g (1 packet)',
  healthScore: 4,
  nutrition: [
    { name: 'Energy', value: '295 kcal', per100g: '421 kcal' },
    { name: 'Protein', value: '7.8 g', per100g: '11.1 g' },
    { name: 'Carbohydrates', value: '41 g', per100g: '58.6 g' },
    { name: 'Total Fat', value: '11 g', per100g: '15.7 g' },
    { name: 'Saturated Fat', value: '5.2 g', per100g: '7.4 g' },
    { name: 'Sodium', value: '504 mg', per100g: '720 mg' },
    { name: 'Dietary Fibre', value: '1.4 g', per100g: '2 g' },
    { name: 'Sugars', value: '2.1 g', per100g: '3 g' },
  ],
  redFlags: [
    'High sodium (720 mg/100g) — recommended <600 mg/100g',
    'High saturated fat (7.4 g/100g)',
    'Contains MSG (flavour enhancer 621)',
    'Refined carbohydrates — low nutritional density',
  ],
  positives: [
    'Contains some B vitamins (fortified)',
    'Moderate protein content',
  ],
  verdict: 'This product is high in sodium and saturated fat, making it unsuitable for regular consumption. Occasional indulgence is fine, but avoid daily use. Consider whole-grain noodles with fresh vegetables as a healthier alternative.',
  alternative: 'Try: Whole wheat pasta / Brown rice with dal — more fibre, lower sodium, higher nutritional value.',
};

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 7 ? '#22C55E' : score >= 5 ? '#F5C518' : '#EF4444';
  const label = score >= 7 ? 'Healthy' : score >= 5 ? 'Moderate' : 'Unhealthy';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `conic-gradient(${color} ${score * 36}deg, #2E2E2E ${score * 36}deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 8, color: '#A0A0A0' }}>/10</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    </div>
  );
}

export default function LabelScannerPage() {
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 2200);
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 620, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Label Scanner</h1>
      <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 24 }}>
        Scan any packaged food label for an instant health analysis
      </p>

      {/* Scanner UI */}
      <div
        style={{
          background: '#111',
          border: '1px solid #2E2E2E',
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 20,
          height: 260,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0A0A1A 0%, #0A0A0A 50%, #0d0A1A 100%)' }} />

        {/* Label-style scanning frame */}
        <div
          style={{
            position: 'absolute',
            width: '70%',
            height: '55%',
            border: `2px dashed ${scanning ? '#3B82F6' : 'rgba(255,255,255,0.25)'}`,
            borderRadius: 12,
            transition: 'border-color 0.3s',
          }}
        >
          {['tl', 'tr', 'bl', 'br'].map((corner) => (
            <div
              key={corner}
              style={{
                position: 'absolute',
                width: 18,
                height: 18,
                borderColor: '#3B82F6',
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

        {/* Scanning line */}
        {scanning && (
          <div
            style={{
              position: 'absolute',
              left: '15%',
              right: '15%',
              height: 2,
              background: '#3B82F6',
              boxShadow: '0 0 10px #3B82F6',
              animation: 'labelScan 1.2s ease-in-out infinite alternate',
              zIndex: 2,
            }}
          />
        )}

        {scanned && (
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 40 }}>📦</div>
            <div style={{ background: 'rgba(59,130,246,0.9)', borderRadius: 8, padding: '4px 12px', marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>Label Read!</span>
            </div>
          </div>
        )}

        {!scanning && !scanned && (
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <ScanLine size={26} color="#3B82F6" />
            </div>
            <p style={{ fontSize: 12, color: '#A0A0A0' }}>Align label with frame</p>
          </div>
        )}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '20px 16px 14px', display: 'flex', justifyContent: 'center' }}>
          {!scanned ? (
            <button
              onClick={handleScan}
              disabled={scanning}
              style={{
                background: scanning ? '#2E2E2E' : '#3B82F6',
                border: 'none',
                borderRadius: 24,
                padding: '10px 28px',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                cursor: scanning ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ScanLine size={16} />
              {scanning ? 'Reading Label...' : 'Scan Demo Label'}
            </button>
          ) : (
            <button
              onClick={() => setScanned(false)}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '8px 20px', color: '#FFFFFF', fontSize: 12, cursor: 'pointer' }}
            >
              Scan Again
            </button>
          )}
        </div>

        <style>{`
          @keyframes labelScan {
            from { top: 22.5%; }
            to { top: 77.5%; }
          }
        `}</style>
      </div>

      {/* Analysis Report */}
      {scanned && (
        <div className="animate-fade-in-up">
          {/* Header */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 20, padding: '20px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              <ScoreGauge score={DEMO_LABEL.healthScore} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Health Analysis Report</p>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>{DEMO_LABEL.product}</h3>
                <p style={{ fontSize: 12, color: '#A0A0A0' }}>Per serving: {DEMO_LABEL.servingSize}</p>
              </div>
            </div>

            {/* Nutrition table */}
            <div style={{ background: '#242424', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '8px 14px', borderBottom: '1px solid #2E2E2E' }}>
                <span style={{ fontSize: 10, color: '#A0A0A0', fontWeight: 700, textTransform: 'uppercase' }}>Nutrient</span>
                <span style={{ fontSize: 10, color: '#A0A0A0', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Per Serving</span>
                <span style={{ fontSize: 10, color: '#A0A0A0', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Per 100g</span>
              </div>
              {DEMO_LABEL.nutrition.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    padding: '9px 14px',
                    borderBottom: i < DEMO_LABEL.nutrition.length - 1 ? '1px solid #2E2E2E' : 'none',
                  }}
                >
                  <span style={{ fontSize: 12, color: '#E0E0E0' }}>{row.name}</span>
                  <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                  <span style={{ fontSize: 12, color: '#A0A0A0', textAlign: 'right' }}>{row.per100g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags */}
          <div style={{ background: '#1A1A1A', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <AlertTriangle size={15} color="#EF4444" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>Red Flags</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_LABEL.redFlags.map((flag, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <XCircle size={13} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: '#E0E0E0', lineHeight: 1.5 }}>{flag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Positives */}
          <div style={{ background: '#1A1A1A', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CheckCircle size={15} color="#22C55E" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#22C55E' }}>Positives</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_LABEL.positives.map((pos, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <CheckCircle size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: '#E0E0E0', lineHeight: 1.5 }}>{pos}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verdict */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 16, padding: '16px 18px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
              Verdict
            </p>
            <p style={{ fontSize: 13, color: '#E0E0E0', lineHeight: 1.7, marginBottom: 12 }}>{DEMO_LABEL.verdict}</p>
            <div style={{ background: 'rgba(34,197,94,0.08)', borderRadius: 10, padding: '10px 12px', borderLeft: '3px solid #22C55E' }}>
              <p style={{ fontSize: 12, color: '#A0A0A0', fontWeight: 600, marginBottom: 2 }}>💡 Healthier Alternative</p>
              <p style={{ fontSize: 12, color: '#E0E0E0', lineHeight: 1.5 }}>{DEMO_LABEL.alternative}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
