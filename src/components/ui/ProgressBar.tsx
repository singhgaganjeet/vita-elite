'use client';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export default function ProgressBar({
  value,
  max,
  color = '#22C55E',
  height = 8,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: '#A0A0A0' }}>{label}</span>
          <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600 }}>
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
      <div
        style={{
          height,
          borderRadius: height / 2,
          background: '#2E2E2E',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: height / 2,
            background: color,
            width: `${pct}%`,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  );
}
