'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Star,
  ChevronRight,
  Plus,
  Activity,
  Footprints,
  Flame,
  Calculator,
  Camera,
  ScanLine,
  Pencil,
  Check,
  X,
  Dumbbell,
} from 'lucide-react';
import CalorieRing from '@/components/ui/CalorieRing';
import MacroBar from '@/components/ui/MacroBar';
import CoachAvatar from '@/components/ui/CoachAvatar';
import { coaches } from '@/data/coaches';
import { useUserStore } from '@/stores/useUserStore';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { useActivityStore } from '@/stores/useActivityStore';

const featuredCoaches = [coaches[0], coaches[10], coaches[20]];

const categoryColors: Record<string, string> = {
  fitness: '#7C3AED',
  diet: '#EC4899',
  physio: '#8B5CF6',
};

const WORKOUT_TYPES = ['Running', 'Walking', 'Yoga', 'HIIT', 'Cycling', 'Strength'];

function LoadingSkeleton() {
  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ height: 40, background: '#F3F0FF', borderRadius: 12, marginBottom: 12, width: '60%' }} />
      <div style={{ height: 200, background: '#F3F0FF', borderRadius: 20, marginBottom: 16 }} />
      <div style={{ height: 120, background: '#F3F0FF', borderRadius: 20, marginBottom: 16 }} />
    </div>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [editingSteps, setEditingSteps] = useState(false);
  const [stepsInput, setStepsInput] = useState('');
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutType, setWorkoutType] = useState('Running');
  const [workoutDuration, setWorkoutDuration] = useState(30);
  const [workoutIntensity, setWorkoutIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  const router = useRouter();

  const profile = useUserStore((s) => s.profile);
  const userMeasurements = useUserStore((s) => s.measurements);
  const getDailyCalorieGoal = useUserStore((s) => s.getDailyCalorieGoal);
  const nutritionLogs = useNutritionStore((s) => s.logs);
  const getTodayTotals = useNutritionStore((s) => s.getTodayTotals);
  const getWeeklyData = useNutritionStore((s) => s.getWeeklyData);
  const getTodayActivity = useActivityStore((s) => s.getTodayActivity);
  const setSteps = useActivityStore((s) => s.setSteps);
  const addWorkout = useActivityStore((s) => s.addWorkout);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <LoadingSkeleton />;

  const totals = getTodayTotals();
  const goal = getDailyCalorieGoal();
  const activity = getTodayActivity();
  const weeklyData = getWeeklyData();

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile.name.split(' ')[0];

  const stepsPercent = Math.min(100, Math.round((activity.steps / 10000) * 100));
  const distance = (activity.steps * 0.0008).toFixed(1);

  const daysHitGoal = weeklyData.filter((d) => d.calories >= d.goal).length;

  const handleSaveSteps = () => {
    const n = parseInt(stepsInput, 10);
    if (!isNaN(n) && n >= 0) setSteps(n);
    setEditingSteps(false);
    setStepsInput('');
  };

  const handleLogWorkout = () => {
    addWorkout({
      type: workoutType,
      duration: workoutDuration,
      intensity: workoutIntensity,
      caloriesBurned: 0, // calculated in store
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
    setShowWorkoutForm(false);
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ve-text)', letterSpacing: '-0.5px', marginBottom: 4 }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ve-text-3)' }}>{dateStr}</p>
      </div>

      {/* Coach Card */}
      <div
        className="gradient-card"
        style={{ padding: '24px 20px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(236,72,153,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Star size={16} color="var(--ve-pink)" fill="var(--ve-pink)" />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ve-pink)' }}>
            Level Up
          </span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 6 }}>
          Level up your health — Book a Coach
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ve-text-3)', marginBottom: 16 }}>
          1-day free consultation. Starts at just <span style={{ color: 'var(--ve-purple)', fontWeight: 700 }}>₹100</span>
        </p>
        <Link href="/coaches" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '0 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Browse Coaches <ChevronRight size={16} />
          </button>
        </Link>
      </div>

      {/* Calorie Ring + Macros */}
      <div
        style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 20,
          padding: '24px 20px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          boxShadow: 'var(--ve-shadow-sm)',
        }}
        className="sm:flex-row"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <CalorieRing consumed={totals.calories} goal={goal} size={160} />
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Eaten', value: totals.calories.toLocaleString(), color: 'var(--ve-purple)' },
              { label: 'Goal', value: goal.toLocaleString(), color: 'var(--ve-text-3)' },
              { label: 'Left', value: Math.max(0, goal - totals.calories).toLocaleString(), color: 'var(--ve-pink)' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--ve-text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, width: '100%', maxWidth: 320 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ve-text-3)', marginBottom: 16 }}>
            Today&apos;s Macros
          </p>
          <MacroBar protein={totals.protein} carbs={totals.carbs} fats={totals.fats} />
        </div>
      </div>

      {/* Quick Log Meals */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ve-text-3)', marginBottom: 12 }}>
          Quick Log
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const).map((meal) => {
            const todayKey = new Date().toISOString().split('T')[0];
            const todayLog = nutritionLogs[todayKey];
            const mealCal = todayLog
              ? Math.round(todayLog.meals[meal].reduce((s, e) => s + e.calories * e.quantity, 0))
              : 0;
            return (
              <button
                key={meal}
                onClick={() => router.push(`/nutrition?meal=${meal}`)}
                style={{
                  background: 'var(--ve-surface)',
                  border: '1px solid var(--ve-border)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  boxShadow: 'var(--ve-shadow-sm)',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ve-text)', marginBottom: 2 }}>{meal}</div>
                  <div style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>
                    {mealCal > 0 ? `${mealCal} kcal` : 'Not logged'}
                  </div>
                </div>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(124,58,237,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Plus size={14} color="var(--ve-purple)" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Summary */}
      <div
        style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 20,
          padding: '20px',
          marginBottom: 16,
          boxShadow: 'var(--ve-shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ve-text-3)' }}>
            Activity Summary
          </p>
          <button
            onClick={() => setShowWorkoutForm((v) => !v)}
            style={{
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: 10,
              padding: '5px 12px',
              color: 'var(--ve-purple)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Dumbbell size={13} /> Log Workout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {/* Steps — editable */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <Footprints size={16} color="var(--ve-purple)" />
            </div>
            {editingSteps ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <input
                  type="number"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  placeholder={String(activity.steps)}
                  style={{
                    width: 72,
                    padding: '2px 6px',
                    background: 'var(--ve-bg)',
                    border: '1px solid var(--ve-purple)',
                    borderRadius: 6,
                    color: 'var(--ve-text)',
                    fontSize: 13,
                    textAlign: 'center',
                  }}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSteps(); if (e.key === 'Escape') setEditingSteps(false); }}
                />
                <button onClick={handleSaveSteps} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ve-purple)', padding: 2 }}>
                  <Check size={14} />
                </button>
                <button onClick={() => setEditingSteps(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ve-text-3)', padding: 2 }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ve-text)', lineHeight: 1 }}>
                  {activity.steps.toLocaleString()}
                </div>
                <button
                  onClick={() => { setEditingSteps(true); setStepsInput(String(activity.steps)); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ve-text-3)', padding: 2 }}
                >
                  <Pencil size={11} />
                </button>
              </div>
            )}
            <div style={{ fontSize: 10, color: 'var(--ve-text-3)' }}>/ 10,000</div>
            <div style={{ fontSize: 10, color: 'var(--ve-text-3)', marginTop: 2 }}>Steps</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <Activity size={16} color="var(--ve-violet)" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ve-text)', lineHeight: 1 }}>{distance}</div>
            <div style={{ fontSize: 10, color: 'var(--ve-text-3)' }}>km</div>
            <div style={{ fontSize: 10, color: 'var(--ve-text-3)', marginTop: 2 }}>Distance</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <Flame size={16} color="var(--ve-pink)" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ve-text)', lineHeight: 1 }}>{activity.caloriesBurned}</div>
            <div style={{ fontSize: 10, color: 'var(--ve-text-3)' }}>kcal</div>
            <div style={{ fontSize: 10, color: 'var(--ve-text-3)', marginTop: 2 }}>Burned</div>
          </div>
        </div>

        {/* Steps Progress Bar */}
        <div style={{ marginBottom: activity.steps === 0 ? 0 : 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>Steps Progress</span>
            <span style={{ fontSize: 12, color: 'var(--ve-purple)', fontWeight: 600 }}>{stepsPercent}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--ve-border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${stepsPercent}%`, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', borderRadius: 4, transition: 'width 0.6s ease' }} />
          </div>
        </div>

        {/* Log Workout Form */}
        {showWorkoutForm && (
          <div style={{ background: 'var(--ve-bg)', border: '1px solid var(--ve-border)', borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 12 }}>Log a Workout</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--ve-text-3)', display: 'block', marginBottom: 4 }}>Type</label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 8, color: 'var(--ve-text)', fontSize: 13, cursor: 'pointer' }}
                >
                  {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--ve-text-3)', display: 'block', marginBottom: 4 }}>Duration (min)</label>
                <input
                  type="number"
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                  min={1}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--ve-surface)', border: '1px solid var(--ve-border)', borderRadius: 8, color: 'var(--ve-text)', fontSize: 13 }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'var(--ve-text-3)', display: 'block', marginBottom: 6 }}>Intensity</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setWorkoutIntensity(level)}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: 8,
                      border: `1px solid ${workoutIntensity === level ? 'var(--ve-purple)' : 'var(--ve-border)'}`,
                      background: workoutIntensity === level ? 'rgba(124,58,237,0.10)' : 'var(--ve-surface)',
                      color: workoutIntensity === level ? 'var(--ve-purple)' : 'var(--ve-text-3)',
                      fontSize: 12,
                      fontWeight: workoutIntensity === level ? 700 : 400,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleLogWorkout}
              style={{
                width: '100%',
                padding: '10px',
                background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                border: 'none',
                borderRadius: 10,
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Log Workout
            </button>
          </div>
        )}

        {/* Today's Workouts */}
        {activity.workouts.length > 0 && (
          <div>
            <p style={{ fontSize: 11, color: 'var(--ve-text-3)', fontWeight: 600, marginBottom: 8 }}>TODAY&apos;S WORKOUTS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activity.workouts.map((w) => (
                <div
                  key={w.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--ve-bg)',
                    border: '1px solid var(--ve-border)',
                    borderRadius: 10,
                    padding: '10px 12px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ve-text)' }}>{w.type}</span>
                    <span style={{ fontSize: 11, color: 'var(--ve-text-3)', marginLeft: 8 }}>{w.duration} min · {w.intensity}</span>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--ve-pink)', fontWeight: 700 }}>{w.caloriesBurned} kcal</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Body Measurements */}
      <div
        style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 20,
          padding: '20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--ve-shadow-sm)',
        }}
      >
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ve-text)', marginBottom: 4 }}>Body Measurements</p>
          <p style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>
            Weight: {userMeasurements.weight.slice(-1)[0]?.value ?? profile.weight} kg
          </p>
        </div>
        <Link href="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ve-purple)', fontSize: 13, fontWeight: 600 }}>
          Update Now <ChevronRight size={14} />
        </Link>
      </div>

      {/* Free Tools */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ve-text-3)', marginBottom: 12 }}>
          Free Tools
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { icon: <Calculator size={20} color="var(--ve-purple)" />, title: 'BMI', href: '/tools/bmi', bg: 'rgba(124,58,237,0.10)' },
            { icon: <Camera size={20} color="var(--ve-pink)" />, title: 'Food Scan', href: '/tools/food-scanner', bg: 'rgba(236,72,153,0.10)' },
            { icon: <ScanLine size={20} color="var(--ve-violet)" />, title: 'Label Scan', href: '/tools/label-scanner', bg: 'rgba(139,92,246,0.10)' },
          ].map((tool) => (
            <Link key={tool.title} href={tool.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: 'var(--ve-surface)',
                  border: '1px solid var(--ve-border)',
                  borderRadius: 16,
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  boxShadow: 'var(--ve-shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: tool.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {tool.icon}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ve-text)' }}>{tool.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Explore Coaches */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ve-text-3)' }}>
            Explore Coaches
          </p>
          <Link href="/coaches" style={{ textDecoration: 'none', fontSize: 12, color: 'var(--ve-purple)', fontWeight: 600 }}>
            View All →
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {featuredCoaches.map((coach) => (
            <Link key={coach.id} href={`/coaches/${coach.id}`} style={{ textDecoration: 'none', flexShrink: 0, width: 200 }}>
              <div
                style={{
                  background: 'var(--ve-surface)',
                  border: '1px solid var(--ve-border)',
                  borderRadius: 16,
                  padding: '16px',
                  cursor: 'pointer',
                  boxShadow: 'var(--ve-shadow-sm)',
                }}
              >
                <CoachAvatar name={coach.name} category={coach.category} size={48} />
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 2 }}>{coach.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ve-text-3)', marginBottom: 8 }}>{coach.city}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: `${categoryColors[coach.category]}18`,
                        color: categoryColors[coach.category],
                        textTransform: 'capitalize',
                      }}
                    >
                      {coach.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={11} color="var(--ve-warning)" fill="var(--ve-warning)" />
                      <span style={{ fontSize: 11, color: 'var(--ve-text-2)', fontWeight: 600 }}>{coach.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Weekly Progress */}
      <div
        style={{
          background: 'var(--ve-surface)',
          border: '1px solid var(--ve-border)',
          borderRadius: 20,
          padding: '20px',
          marginBottom: 16,
          boxShadow: 'var(--ve-shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Activity size={16} color="var(--ve-purple)" />
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ve-text)' }}>Weekly Progress</p>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ve-text-3)', marginBottom: 20 }}>
          You hit your goal{' '}
          <span style={{ color: 'var(--ve-purple)', fontWeight: 700 }}>{daysHitGoal} out of 7</span> days this week
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyData} barSize={20}>
            <XAxis
              dataKey="day"
              tick={{ fill: '#9B8EC4', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#FFFFFF', border: '1px solid var(--ve-border)', borderRadius: 10, color: '#1A0A2E', boxShadow: '0 4px 24px rgba(124,58,237,0.10)' }}
              cursor={{ fill: 'rgba(124,58,237,0.05)' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((v: any) => [`${v} kcal`, 'Calories']) as any}
            />
            <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
              {weeklyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.calories >= entry.goal ? '#7C3AED' : '#E8E0FA'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
