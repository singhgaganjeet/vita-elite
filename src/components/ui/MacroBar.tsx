'use client';

interface MacroBarProps {
  protein: number;
  carbs: number;
  fats: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatsGoal?: number;
}

export default function MacroBar({
  protein,
  carbs,
  fats,
  proteinGoal = 160,
  carbsGoal = 250,
  fatsGoal = 70,
}: MacroBarProps) {
  const macros = [
    { label: 'Protein', value: protein, goal: proteinGoal, color: '#7C3AED', unit: 'g' },
    { label: 'Carbs',   value: carbs,   goal: carbsGoal,   color: '#A855F7', unit: 'g' },
    { label: 'Fats',    value: fats,    goal: fatsGoal,    color: '#EC4899', unit: 'g' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      {macros.map((m) => (
        <div key={m.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: '#9B8EC4', fontWeight: 500 }}>{m.label}</span>
            <span style={{ fontSize: 12, color: '#1A0A2E', fontWeight: 600 }}>
              {m.value}{m.unit}
              <span style={{ color: '#9B8EC4', fontWeight: 400 }}> / {m.goal}{m.unit}</span>
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: '#E8E0FA', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 3,
                background: m.color,
                width: `${Math.min((m.value / m.goal) * 100, 100)}%`,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
