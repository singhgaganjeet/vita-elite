'use client';

import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Star,
  ChevronRight,
  Plus,
  Activity,
  Footprints,
  Flame,
  MapPin,
  Calculator,
  Camera,
  ScanLine,
  Utensils,
} from 'lucide-react';
import CalorieRing from '@/components/ui/CalorieRing';
import MacroBar from '@/components/ui/MacroBar';
import CoachAvatar from '@/components/ui/CoachAvatar';
import { coaches } from '@/data/coaches';

const weeklyData = [
  { day: 'Mon', calories: 2050, goal: 2100 },
  { day: 'Tue', calories: 1920, goal: 2100 },
  { day: 'Wed', calories: 2180, goal: 2100 },
  { day: 'Thu', calories: 1850, goal: 2100 },
  { day: 'Fri', calories: 2090, goal: 2100 },
  { day: 'Sat', calories: 1760, goal: 2100 },
  { day: 'Sun', calories: 1840, goal: 2100 },
];

const featuredCoaches = [coaches[0], coaches[10], coaches[20]]; // fitness, diet, physio

const categoryColors: Record<string, string> = {
  fitness: '#22C55E',
  diet: '#F5C518',
  physio: '#3B82F6',
};

export default function DashboardPage() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px', marginBottom: 4 }}>
          {greeting}, Priya 👋
        </h1>
        <p style={{ fontSize: 14, color: '#A0A0A0' }}>{dateStr}</p>
      </div>

      {/* Calorie Ring + Macros */}
      <div
        style={{
          background: '#1A1A1A',
          border: '1px solid #2E2E2E',
          borderRadius: 20,
          padding: '24px 20px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
        className="sm:flex-row"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <CalorieRing consumed={1840} goal={2100} size={160} />
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Eaten', value: '1,840', color: '#22C55E' },
              { label: 'Goal', value: '2,100', color: '#A0A0A0' },
              { label: 'Remaining', value: '260', color: '#F5C518' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#A0A0A0' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, width: '100%', maxWidth: 320 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A0A0A0', marginBottom: 16 }}>
            Today&apos;s Macros
          </p>
          <MacroBar protein={142} carbs={210} fats={58} />
        </div>
      </div>

      {/* Quick Log Meals */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A0A0A0', marginBottom: 12 }}>
          Quick Log
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal, i) => (
            <Link key={meal} href="/nutrition" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2E2E2E',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 2 }}>{meal}</div>
                  <div style={{ fontSize: 11, color: '#A0A0A0' }}>
                    {[320, 540, 480, 200][i]} kcal
                  </div>
                </div>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(34,197,94,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={14} color="#22C55E" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div
        style={{
          background: '#1A1A1A',
          border: '1px solid #2E2E2E',
          borderRadius: 20,
          padding: '20px',
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A0A0A0', marginBottom: 16 }}>
          Activity Summary
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {[
            { icon: <Footprints size={16} color="#22C55E" />, label: 'Steps', value: '6,240', sub: '/ 10,000' },
            { icon: <MapPin size={16} color="#3B82F6" />, label: 'Distance', value: '4.2', sub: 'km' },
            { icon: <Flame size={16} color="#F97316" />, label: 'Burned', value: '320', sub: 'kcal' },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: 10, color: '#A0A0A0' }}>{item.sub}</div>
              <div style={{ fontSize: 10, color: '#A0A0A0', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#A0A0A0' }}>Steps Progress</span>
            <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>62%</span>
          </div>
          <div style={{ height: 8, background: '#2E2E2E', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '62%', background: '#22C55E', borderRadius: 4, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      </div>

      {/* Coach Card — no coach booked */}
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
            background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(34,197,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Star size={16} color="#F5C518" fill="#F5C518" />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#F5C518',
            }}
          >
            Level Up
          </span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
          Level up your health — Book a Coach
        </h3>
        <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 16 }}>
          1-day free consultation. Starts at just <span style={{ color: '#F5C518', fontWeight: 700 }}>₹100</span>
        </p>
        <Link href="/coaches" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '0 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Browse Coaches <ChevronRight size={16} />
          </button>
        </Link>
      </div>

      {/* Body Measurements */}
      <div
        style={{
          background: '#1A1A1A',
          border: '1px solid #2E2E2E',
          borderRadius: 20,
          padding: '20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>Body Measurements</p>
          <p style={{ fontSize: 12, color: '#A0A0A0' }}>Last updated 3 days ago</p>
        </div>
        <Link href="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, color: '#22C55E', fontSize: 13, fontWeight: 600 }}>
          Update Now <ChevronRight size={14} />
        </Link>
      </div>

      {/* Freebies */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A0A0A0', marginBottom: 12 }}>
          Free Tools
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { icon: <Calculator size={20} color="#22C55E" />, title: 'BMI', href: '/tools/bmi', bg: 'rgba(34,197,94,0.12)' },
            { icon: <Camera size={20} color="#F5C518" />, title: 'Food Scan', href: '/tools/food-scanner', bg: 'rgba(245,197,24,0.12)' },
            { icon: <ScanLine size={20} color="#3B82F6" />, title: 'Label Scan', href: '/tools/label-scanner', bg: 'rgba(59,130,246,0.12)' },
          ].map((tool) => (
            <Link key={tool.title} href={tool.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2E2E2E',
                  borderRadius: 16,
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
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
                <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>{tool.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Explore Coaches */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#A0A0A0' }}>
            Explore Coaches
          </p>
          <Link href="/coaches" style={{ textDecoration: 'none', fontSize: 12, color: '#22C55E', fontWeight: 600 }}>
            View All →
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {featuredCoaches.map((coach) => (
            <Link key={coach.id} href={`/coaches/${coach.id}`} style={{ textDecoration: 'none', flexShrink: 0, width: 200 }}>
              <div
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2E2E2E',
                  borderRadius: 16,
                  padding: '16px',
                  cursor: 'pointer',
                }}
              >
                <CoachAvatar name={coach.name} category={coach.category} size={48} />
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>{coach.name}</div>
                  <div style={{ fontSize: 11, color: '#A0A0A0', marginBottom: 8 }}>{coach.city}</div>
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
                      <Star size={11} color="#F5C518" fill="#F5C518" />
                      <span style={{ fontSize: 11, color: '#FFFFFF', fontWeight: 600 }}>{coach.rating}</span>
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
          background: '#1A1A1A',
          border: '1px solid #2E2E2E',
          borderRadius: 20,
          padding: '20px',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Activity size={16} color="#22C55E" />
          <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Weekly Progress</p>
        </div>
        <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 20 }}>
          You hit your goal <span style={{ color: '#22C55E', fontWeight: 700 }}>5 out of 7</span> days this week
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weeklyData} barSize={20}>
            <XAxis
              dataKey="day"
              tick={{ fill: '#A0A0A0', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#242424', border: '1px solid #2E2E2E', borderRadius: 10, color: '#FFFFFF' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((v: any) => [`${v} kcal`, 'Calories']) as any}
            />
            <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
              {weeklyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.calories >= entry.goal ? '#22C55E' : '#2E2E2E'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
