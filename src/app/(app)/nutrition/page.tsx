'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
} from 'recharts';
import { Plus, X, Search, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import CalorieRing from '@/components/ui/CalorieRing';
import { foods } from '@/data/foods';
import { useNutritionStore, type MealType, type FoodEntry } from '@/stores/useNutritionStore';
import { useUserStore } from '@/stores/useUserStore';

const MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

interface OFFProduct {
  code: string
  product_name: string
  nutriments: {
    'energy-kcal_100g'?: number
    'proteins_100g'?: number
    'carbohydrates_100g'?: number
    'fat_100g'?: number
    'fiber_100g'?: number
    'sugars_100g'?: number
    'sodium_100g'?: number
  }
  serving_size?: string
}

interface SearchResult {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fibre: number
  per100g: boolean
  servingLabel: string
}

function fromLocal(food: typeof foods[0]): SearchResult {
  return {
    id: `local-${food.id}`,
    name: food.name,
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fats: food.fats,
    fibre: food.fibre,
    per100g: false,
    servingLabel: food.servingLabel,
  };
}

function fromOFF(p: OFFProduct): SearchResult {
  return {
    id: `off-${p.code}`,
    name: p.product_name || 'Unknown Product',
    calories: Math.round(p.nutriments['energy-kcal_100g'] ?? 0),
    protein: Math.round((p.nutriments['proteins_100g'] ?? 0) * 10) / 10,
    carbs: Math.round((p.nutriments['carbohydrates_100g'] ?? 0) * 10) / 10,
    fats: Math.round((p.nutriments['fat_100g'] ?? 0) * 10) / 10,
    fibre: Math.round((p.nutriments['fiber_100g'] ?? 0) * 10) / 10,
    per100g: true,
    servingLabel: 'per 100g',
  };
}

function NutritionPageInner() {
  const searchParams = useSearchParams();
  const initialMeal = (searchParams.get('meal') as MealType) ?? null;

  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<Record<MealType, boolean>>({
    Breakfast: true,
    Lunch: false,
    Dinner: false,
    Snacks: false,
  });
  const [modalMeal, setModalMeal] = useState<MealType | null>(initialMeal);
  const [search, setSearch] = useState('');
  const [qty, setQty] = useState(100);
  const [selectedFood, setSelectedFood] = useState<SearchResult | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const logs = useNutritionStore((s) => s.logs);
  const addFoodEntry = useNutritionStore((s) => s.addFoodEntry);
  const removeFoodEntry = useNutritionStore((s) => s.removeFoodEntry);
  const getDailyCalorieGoal = useUserStore((s) => s.getDailyCalorieGoal);

  const todayKey = new Date().toISOString().split('T')[0];

  useEffect(() => { setMounted(true); }, []);

  // When modal opens via URL param, expand that meal
  useEffect(() => {
    if (initialMeal) {
      setExpanded((p) => ({ ...p, [initialMeal]: true }));
    }
  }, [initialMeal]);

  const log = useMemo(() => {
    return logs[todayKey] ?? { date: todayKey, meals: { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] } };
  }, [logs, todayKey]);

  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fats = 0, fibre = 0;
    MEALS.forEach((meal) => {
      log.meals[meal].forEach((e) => {
        calories += e.calories * e.quantity;
        protein += e.protein * e.quantity;
        carbs += e.carbs * e.quantity;
        fats += e.fats * e.quantity;
        fibre += e.fibre * e.quantity;
      });
    });
    return { calories: Math.round(calories), protein: Math.round(protein), carbs: Math.round(carbs), fats: Math.round(fats), fibre: Math.round(fibre) };
  }, [log]);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLog = logs[dateStr];
      let cal = 0;
      if (dayLog) {
        MEALS.forEach((meal) => {
          dayLog.meals[meal].forEach((e) => { cal += e.calories * e.quantity; });
        });
      }
      result.push({ day: days[d.getDay()], calories: Math.round(cal), goal: 1800 });
    }
    return result;
  }, [logs]);

  // Search Open Food Facts or local foods
  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(foods.map(fromLocal));
      return;
    }
    // First filter local foods
    const localMatches = foods
      .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
      .map(fromLocal);

    setSearching(true);
    setSearchError('');
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,nutriments,serving_size,product_quantity`;
      const res = await fetch(url);
      const data = await res.json();
      const offResults: SearchResult[] = (data.products ?? [])
        .filter((p: OFFProduct) => p.product_name && p.nutriments?.['energy-kcal_100g'])
        .map(fromOFF);
      setSearchResults([...localMatches, ...offResults]);
    } catch {
      setSearchError('Could not reach Open Food Facts — showing local foods only');
      setSearchResults(localMatches.length > 0 ? localMatches : foods.map(fromLocal));
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (modalMeal !== null) {
        doSearch(search);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, modalMeal, doSearch]);

  // Init search results when modal opens
  useEffect(() => {
    if (modalMeal !== null && searchResults.length === 0) {
      setSearchResults(foods.map(fromLocal));
    }
  }, [modalMeal, searchResults.length]);

  if (!mounted) {
    return (
      <div style={{ padding: '24px 20px' }}>
        <div style={{ height: 40, background: '#F3F0FF', borderRadius: 12, marginBottom: 16, width: '40%' }} />
        <div style={{ height: 200, background: '#F3F0FF', borderRadius: 20, marginBottom: 16 }} />
      </div>
    );
  }

  const goal = getDailyCalorieGoal();

  const mealCalories = (meal: MealType) =>
    Math.round(log.meals[meal].reduce((s, e) => s + e.calories * e.quantity, 0));

  const macroPie = [
    { name: 'Protein', value: totals.protein * 4, fill: 'var(--ve-purple)' },
    { name: 'Carbs', value: totals.carbs * 4, fill: '#F5C518' },
    { name: 'Fats', value: totals.fats * 9, fill: '#F97316' },
  ];

  const computedQtyCalories = selectedFood
    ? selectedFood.per100g
      ? Math.round((selectedFood.calories * qty) / 100)
      : Math.round(selectedFood.calories * qty)
    : 0;

  const handleAddFood = () => {
    if (!modalMeal || !selectedFood) return;
    const scale = selectedFood.per100g ? qty / 100 : qty;
    const entry: Omit<FoodEntry, 'id' | 'addedAt'> = {
      name: selectedFood.name,
      calories: Math.round(selectedFood.calories * (selectedFood.per100g ? qty / 100 : 1)),
      protein: Math.round(selectedFood.protein * scale * 10) / 10,
      carbs: Math.round(selectedFood.carbs * scale * 10) / 10,
      fats: Math.round(selectedFood.fats * scale * 10) / 10,
      fibre: Math.round(selectedFood.fibre * scale * 10) / 10,
      quantity: 1,
      unit: selectedFood.per100g ? `${qty}g` : selectedFood.servingLabel,
    };
    addFoodEntry(modalMeal, entry);
    setModalMeal(null);
    setSelectedFood(null);
    setSearch('');
    setQty(100);
    setSearchResults([]);
  };

  const openModal = (meal: MealType) => {
    setModalMeal(meal);
    setSelectedFood(null);
    setSearch('');
    setQty(100);
    setSearchResults(foods.map(fromLocal));
  };

  const closeModal = () => {
    setModalMeal(null);
    setSelectedFood(null);
    setSearch('');
    setSearchResults([]);
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>Nutrition</h1>
      <p style={{ fontSize: 14, color: 'var(--ve-text-3)', marginBottom: 24 }}>Today&apos;s food diary</p>

      {/* Calorie ring */}
      <div
        style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 20,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          marginBottom: 20,
          boxShadow: 'var(--ve-shadow-sm)',
        }}
        className="sm:flex-row"
      >
        <CalorieRing consumed={totals.calories} goal={goal} size={140} />
        <div style={{ flex: 1, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Protein', value: totals.protein, unit: 'g', color: 'var(--ve-purple)' },
              { label: 'Carbs', value: totals.carbs, unit: 'g', color: '#F5C518' },
              { label: 'Fats', value: totals.fats, unit: 'g', color: '#F97316' },
            ].map((m) => (
              <div key={m.label} style={{ textAlign: 'center', background: 'var(--ve-surface-2)', border: '1px solid var(--ve-border)', borderRadius: 12, padding: '12px 8px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>
                  {m.value}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ve-text-3)' }}>{m.unit}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ve-text-3)', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meal Accordions */}
      {MEALS.map((meal) => (
        <div
          key={meal}
          style={{
            background: 'var(--ve-surface)',
            border: '1px solid var(--ve-border)',
            borderRadius: 16,
            marginBottom: 10,
            overflow: 'hidden',
            boxShadow: 'var(--ve-shadow-sm)',
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
              color: 'var(--ve-text)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{meal}</span>
              <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{mealCalories(meal)} kcal</span>
            </div>
            {expanded[meal] ? <ChevronUp size={16} color="var(--ve-text-3)" /> : <ChevronDown size={16} color="var(--ve-text-3)" />}
          </button>

          {expanded[meal] && (
            <div style={{ padding: '0 20px 16px' }}>
              {log.meals[meal].length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 12 }}>No items logged yet</p>
              )}
              {log.meals[meal].map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--ve-border)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)' }}>{entry.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>
                      {entry.quantity > 1 ? `${entry.quantity} × ` : ''}{entry.unit} · {Math.round(entry.calories * entry.quantity)} kcal
                    </div>
                  </div>
                  <button
                    onClick={() => removeFoodEntry(meal, entry.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ve-text-3)', padding: 4 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => openModal(meal)}
                style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px dashed rgba(124,58,237,0.35)',
                  borderRadius: 10,
                  color: 'var(--ve-purple)',
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
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 20,
          padding: '20px',
          marginTop: 20,
          marginBottom: 20,
          boxShadow: 'var(--ve-shadow-sm)',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 16 }}>Daily Summary</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Total Calories', value: `${totals.calories} kcal`, color: 'var(--ve-text)' },
            { label: 'Calorie Goal', value: `${goal} kcal`, color: 'var(--ve-text-2)' },
            {
              label: 'Net Calories',
              value: `${totals.calories - goal > 0 ? '+' : ''}${totals.calories - goal} kcal`,
              color: totals.calories > goal ? 'var(--ve-danger)' : 'var(--ve-purple)',
            },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--ve-border)' }}>
              <span style={{ fontSize: 13, color: 'var(--ve-text-3)' }}>{row.label}</span>
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
            {[
              { name: 'Protein', value: totals.protein, fill: 'var(--ve-purple)' },
              { name: 'Carbs', value: totals.carbs, fill: '#F5C518' },
              { name: 'Fats', value: totals.fats, fill: '#F97316' },
            ].map((m) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.fill, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{m.name}</span>
                <span style={{ fontSize: 12, color: 'var(--ve-text)', fontWeight: 600, marginLeft: 'auto' }}>{m.value}g</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div style={{ background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 20, padding: '20px', boxShadow: 'var(--ve-shadow-sm)' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 16 }}>This Week</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyData} barSize={22}>
            <XAxis dataKey="day" tick={{ fill: 'var(--ve-text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#FFFFFF', border: '1px solid var(--ve-border)', borderRadius: 10, color: 'var(--ve-text)' }}
              cursor={{ fill: 'rgba(124,58,237,0.04)' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((v: any) => [`${v} kcal`, '']) as any}
            />
            <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
              {weeklyData.map((entry, i) => (
                <Cell key={i} fill={entry.calories >= entry.goal ? 'var(--ve-purple)' : 'var(--ve-border)'} />
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
            background: 'rgba(26,10,46,0.45)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px 24px 0 0',
              border: '1px solid var(--ve-border)',
              borderBottom: 'none',
              width: '100%',
              maxWidth: 600,
              padding: '28px 24px 32px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: 'var(--ve-shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ve-text)' }}>Add to {modalMeal}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ve-text-3)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: 4 }}>
              <Search size={16} color="var(--ve-text-3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              {searching && (
                <Loader2 size={16} color="var(--ve-purple)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />
              )}
              <input
                className="input-field"
                placeholder="Search foods or scan barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 40, paddingRight: 40 }}
                autoFocus
              />
            </div>
            {search.trim() && (
              <p style={{ fontSize: 11, color: 'var(--ve-text-3)', marginBottom: 12 }}>
                Searching local + Open Food Facts database
              </p>
            )}
            {searchError && (
              <p style={{ fontSize: 11, color: '#F97316', marginBottom: 8 }}>{searchError}</p>
            )}

            {/* Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, maxHeight: 280, overflowY: 'auto' }}>
              {searchResults.length === 0 && !searching && (
                <p style={{ fontSize: 13, color: 'var(--ve-text-3)', textAlign: 'center', padding: '20px 0' }}>No foods found</p>
              )}
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  onClick={() => { setSelectedFood(food); setQty(food.per100g ? 100 : 1); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: selectedFood?.id === food.id ? 'rgba(124,58,237,0.08)' : 'var(--ve-surface-2)',
                    border: `1px solid ${selectedFood?.id === food.id ? 'rgba(124,58,237,0.40)' : 'var(--ve-border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>
                      {food.per100g ? 'per 100g' : food.servingLabel}
                      {!food.id.startsWith('local-') && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--ve-text-3)', background: 'var(--ve-surface-3)', borderRadius: 4, padding: '1px 5px' }}>OFF</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-purple)' }}>{food.calories}</div>
                    <div style={{ fontSize: 10, color: 'var(--ve-text-3)' }}>kcal</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity selector */}
            {selectedFood && (
              <div style={{ background: 'var(--ve-surface-2)', border: '1px solid var(--ve-border)', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--ve-text-2)', marginBottom: 10 }}>
                  {selectedFood.per100g ? 'Amount (grams)' : 'Quantity'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {selectedFood.per100g ? (
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                      min={1}
                      style={{
                        width: 80,
                        padding: '6px 10px',
                        background: '#FFFFFF',
                        border: '1px solid var(--ve-border)',
                        borderRadius: 8,
                        color: 'var(--ve-text)',
                        fontSize: 16,
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => setQty(Math.max(0.5, qty - 0.5))}
                        style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ve-border)', border: 'none', cursor: 'pointer', color: 'var(--ve-text)', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >−</button>
                      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--ve-text)', minWidth: 30, textAlign: 'center' }}>{qty}</span>
                      <button
                        onClick={() => setQty(qty + 0.5)}
                        style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ve-border)', border: 'none', cursor: 'pointer', color: 'var(--ve-text)', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >+</button>
                    </>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>
                    {selectedFood.per100g ? 'g' : selectedFood.servingLabel}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: 'var(--ve-purple)' }}>
                    {computedQtyCalories} kcal
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleAddFood}
              disabled={!selectedFood}
              className="btn-primary"
              style={{ width: '100%', opacity: selectedFood ? 1 : 0.4 }}
            >
              Add to {modalMeal}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function NutritionPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--ve-text-3)' }}>Loading...</div>}>
      <NutritionPageInner />
    </Suspense>
  );
}
