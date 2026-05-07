'use client';

import { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { Plus, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import CalorieRing from '@/components/ui/CalorieRing';
import { foods, Food } from '@/data/foods';

type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

interface LoggedItem {
  food: Food;
  quantity: number;
}

const MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const DAILY_GOAL = 2100;

const weeklyData = [
  { day: 'Mon', cal: 2050 },
  { day: 'Tue', cal: 1920 },
  { day: 'Wed', cal: 2180 },
  { day: 'Thu', cal: 1850 },
  { day: 'Fri', cal: 2090 },
  { day: 'Sat', cal: 1760 },
  { day: 'Sun', cal: 0 },
];

export default function NutritionPage() {
  const [logged, setLogged] = useState<Record<MealType, LoggedItem[]>>({
    Breakfast: [
      { food: foods[3], quantity: 1 },
      { food: foods[7], quantity: 2 },
    ],
    Lunch: [{ food: foods[8], quantity: 1 }],
    Dinner: [],
    Snacks: [{ food: foods[12], quantity: 1 }],
  });

  const [expanded, setExpanded] = useState<Record<MealType, boolean>>({
    Breakfast: true,
    Lunch: false,
    Dinner: false,
    Snacks: false,
  });

  const [modalMeal, setModalMeal] = useState<MealType | null>(null);
  const [search, setSearch] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const filteredFoods = useMemo(() =>
    foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const totalNutrition = useMemo(() => {
    let cal = 0, protein = 0, carbs = 0, fats = 0;
    Object.values(logged).forEach((items) => {
      items.forEach(({ food, quantity }) => {
        cal += food.calories * quantity;
        protein += food.protein * quantity;
        carbs += food.carbs * quantity;
        fats += food.fats * quantity;
      });
    });
    return { cal: Math.round(cal), protein: Math.round(protein), carbs: Math.round(carbs), fats: Math.round(fats) };
  }, [logged]);

  const mealCalories = (meal: MealType) =>
    logged[meal].reduce((s, { food, quantity }) => s + food.calories * quantity, 0);

  const removeItem = (meal: MealType, idx: number) => {
    setLogged((prev) => ({ ...prev, [meal]: prev[meal].filter((_, i) => i !== idx) }));
  };

  const addFood = () => {
    if (!modalMeal || !selectedFood) return;
    setLogged((prev) => ({
      ...prev,
      [modalMeal]: [...prev[modalMeal], { food: selectedFood, quantity: qty }],
    }));
    setModalMeal(null);
    setSelectedFood(null);
    setSearch('');
    setQty(1);
  };

  const macroPie = [
    { name: 'Protein', value: totalNutrition.protein * 4, fill: '#22C55E' },
    { name: 'Carbs', value: totalNutrition.carbs * 4, fill: '#F5C518' },
    { name: 'Fats', value: totalNutrition.fats * 9, fill: '#F97316' },
  ];

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Nutrition</h1>
      <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 24 }}>Today&apos;s food diary</p>

      {/* Calorie header */}
      <div
        style={{
          background: '#1A1A1A',
          border: '1px solid #2E2E2E',
          borderRadius: 20,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          marginBottom: 20,
        }}
        className="sm:flex-row"
      >
        <CalorieRing consumed={totalNutrition.cal} goal={DAILY_GOAL} size={140} />
        <div style={{ flex: 1, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Protein', value: totalNutrition.protein, unit: 'g', color: '#22C55E' },
              { label: 'Carbs', value: totalNutrition.carbs, unit: 'g', color: '#F5C518' },
              { label: 'Fats', value: totalNutrition.fats, unit: 'g', color: '#F97316' },
            ].map((m) => (
              <div key={m.label} style={{ textAlign: 'center', background: '#242424', borderRadius: 12, padding: '12px 8px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}<span style={{ fontSize: 12, fontWeight: 400, color: '#A0A0A0' }}>{m.unit}</span></div>
                <div style={{ fontSize: 11, color: '#A0A0A0', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meal accordions */}
      {MEALS.map((meal) => (
        <div
          key={meal}
          style={{
            background: '#1A1A1A',
            border: '1px solid #2E2E2E',
            borderRadius: 16,
            marginBottom: 10,
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setExpanded((p) => ({ ...p, [meal]: !p[meal] }))}
            style={{
              width: '100%',
              padding: '16px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{meal}</span>
              <span style={{ fontSize: 12, color: '#A0A0A0' }}>{Math.round(mealCalories(meal))} kcal</span>
            </div>
            {expanded[meal] ? <ChevronUp size={16} color="#A0A0A0" /> : <ChevronDown size={16} color="#A0A0A0" />}
          </button>

          {expanded[meal] && (
            <div style={{ padding: '0 20px 16px' }}>
              {logged[meal].length === 0 && (
                <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 12 }}>No items logged yet</p>
              )}
              {logged[meal].map(({ food, quantity }, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #2E2E2E',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{food.name}</div>
                    <div style={{ fontSize: 11, color: '#A0A0A0' }}>
                      {quantity} × {food.servingLabel} · {Math.round(food.calories * quantity)} kcal
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(meal, idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0A0A0', padding: 4 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setModalMeal(meal)}
                style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px dashed rgba(34,197,94,0.4)',
                  borderRadius: 10,
                  color: '#22C55E',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '8px 14px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add Food
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Daily Summary */}
      <div
        style={{
          background: '#1A1A1A',
          border: '1px solid #2E2E2E',
          borderRadius: 20,
          padding: '20px',
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>Daily Summary</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Total Calories', value: `${totalNutrition.cal} kcal`, color: '#FFFFFF' },
            { label: 'Calorie Goal', value: `${DAILY_GOAL} kcal`, color: '#A0A0A0' },
            { label: 'Net Calories', value: `${totalNutrition.cal - DAILY_GOAL > 0 ? '+' : ''}${totalNutrition.cal - DAILY_GOAL} kcal`, color: totalNutrition.cal > DAILY_GOAL ? '#EF4444' : '#22C55E' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #2E2E2E' }}>
              <span style={{ fontSize: 13, color: '#A0A0A0' }}>{row.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 120, height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={macroPie} cx="50%" cy="50%" innerRadius={34} outerRadius={52} dataKey="value" strokeWidth={0}>
                  {macroPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {macroPie.map((m) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.fill, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#A0A0A0' }}>{m.name}</span>
                <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600, marginLeft: 'auto' }}>{Math.round(m.value / 4)}{m.name !== 'Fats' ? 'g' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div
        style={{
          background: '#1A1A1A',
          border: '1px solid #2E2E2E',
          borderRadius: 20,
          padding: '20px',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>This Week</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyData} barSize={22}>
            <XAxis dataKey="day" tick={{ fill: '#A0A0A0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#242424', border: '1px solid #2E2E2E', borderRadius: 10, color: '#FFFFFF' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((v: any) => [`${v} kcal`, '']) as any}
            />
            <Bar dataKey="cal" radius={[6, 6, 0, 0]}>
              {weeklyData.map((_, i) => (
                <Cell key={i} fill={i < 6 ? '#22C55E' : '#2E2E2E'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Add Food Modal */}
      {modalMeal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalMeal(null); }}
        >
          <div
            style={{
              background: '#1A1A1A',
              borderRadius: '24px 24px 0 0',
              border: '1px solid #2E2E2E',
              borderBottom: 'none',
              width: '100%',
              maxWidth: 600,
              padding: '28px 24px 32px',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>Add to {modalMeal}</h3>
              <button
                onClick={() => setModalMeal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0A0A0' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={16} color="#A0A0A0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input-field"
                placeholder="Search Indian foods..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 40 }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: selectedFood?.id === food.id ? 'rgba(34,197,94,0.12)' : '#242424',
                    border: `1px solid ${selectedFood?.id === food.id ? 'rgba(34,197,94,0.4)' : '#2E2E2E'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>{food.name}</div>
                    <div style={{ fontSize: 11, color: '#A0A0A0' }}>{food.servingLabel}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#22C55E' }}>{food.calories}</div>
                    <div style={{ fontSize: 10, color: '#A0A0A0' }}>kcal</div>
                  </div>
                </div>
              ))}
            </div>

            {selectedFood && (
              <div style={{ background: '#242424', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 10 }}>Quantity</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button
                    onClick={() => setQty(Math.max(0.5, qty - 0.5))}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: '#2E2E2E', border: 'none', cursor: 'pointer', color: '#FFFFFF', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >−</button>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', minWidth: 30, textAlign: 'center' }}>{qty}</span>
                  <button
                    onClick={() => setQty(qty + 0.5)}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: '#2E2E2E', border: 'none', cursor: 'pointer', color: '#FFFFFF', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                  <span style={{ fontSize: 12, color: '#A0A0A0' }}>{selectedFood.servingLabel}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: '#22C55E' }}>
                    {Math.round(selectedFood.calories * qty)} kcal
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={addFood}
              disabled={!selectedFood}
              className="btn-primary"
              style={{ width: '100%', opacity: selectedFood ? 1 : 0.4 }}
            >
              Add to {modalMeal}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
