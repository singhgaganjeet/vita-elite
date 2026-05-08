'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star, Filter } from 'lucide-react';
import CoachAvatar from '@/components/ui/CoachAvatar';
import { coaches, CoachCategory } from '@/data/coaches';

type SortKey = 'rating' | 'experience' | 'priceLow' | 'priceHigh';

const categoryMeta: Record<string, { label: string; color: string }> = {
  fitness: { label: 'Fitness', color: '#7C3AED' },
  diet: { label: 'Diet', color: '#F59E0B' },
  physio: { label: 'Physiotherapy', color: '#8B5CF6' },
};

export default function CoachesPage() {
  const [category, setCategory] = useState<CoachCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('rating');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = coaches;
    if (category !== 'all') list = list.filter((c) => c.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.specialisations.some((s) => s.toLowerCase().includes(q)) ||
          c.city.toLowerCase().includes(q)
      );
    }
    if (genderFilter !== 'all') list = list.filter((c) => c.gender === genderFilter);

    return [...list].sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'experience') return b.experience - a.experience;
      if (sort === 'priceLow') return a.price - b.price;
      if (sort === 'priceHigh') return b.price - a.price;
      return 0;
    });
  }, [category, search, sort, genderFilter]);

  const counts = useMemo(() => ({
    all: coaches.length,
    fitness: coaches.filter((c) => c.category === 'fitness').length,
    diet: coaches.filter((c) => c.category === 'diet').length,
    physio: coaches.filter((c) => c.category === 'physio').length,
  }), []);

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>Find a Coach</h1>
      <p style={{ fontSize: 14, color: 'var(--ve-text-3)', marginBottom: 24 }}>
        {coaches.length} verified experts ready to come to you
      </p>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {([
          ['all', 'All', 'var(--ve-purple)'],
          ['fitness', 'Fitness', 'var(--ve-purple)'],
          ['diet', 'Diet', '#F59E0B'],
          ['physio', 'Physiotherapy', 'var(--ve-violet)'],
        ] as const).map(([key, label, color]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: 20,
              border: `1.5px solid ${category === key ? color : 'var(--ve-border)'}`,
              background: category === key
                ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)'
                : 'var(--ve-surface)',
              color: category === key ? '#FFFFFF' : 'var(--ve-text-3)',
              fontSize: 13,
              fontWeight: category === key ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
              boxShadow: category === key ? '0 4px 24px rgba(124,58,237,0.10)' : 'none',
            }}
          >
            {label} <span style={{ opacity: 0.7 }}>({counts[key]})</span>
          </button>
        ))}
      </div>

      {/* Search + Sort + Filter row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} color="var(--ve-text-3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input-field"
            placeholder="Search name, specialisation, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <select
          className="input-field"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          style={{ width: 'auto', minWidth: 160, cursor: 'pointer' }}
        >
          <option value="rating">Sort: Rating</option>
          <option value="experience">Sort: Experience</option>
          <option value="priceLow">Price: Low → High</option>
          <option value="priceHigh">Price: High → Low</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            height: 48,
            padding: '0 16px',
            borderRadius: 10,
            background: showFilters ? 'rgba(124,58,237,0.08)' : 'var(--ve-surface)',
            border: `1px solid ${showFilters ? 'rgba(124,58,237,0.35)' : 'var(--ve-border)'}`,
            color: showFilters ? 'var(--ve-purple)' : 'var(--ve-text-3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: '0 4px 24px rgba(124,58,237,0.10)',
          }}
        >
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div
          style={{
            background: 'var(--ve-surface)',
            border: '1px solid var(--ve-border)',
            borderRadius: 16,
            padding: '20px',
            marginBottom: 20,
            boxShadow: '0 4px 24px rgba(124,58,237,0.10)',
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--ve-text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            Gender
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['all', 'male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `1px solid ${genderFilter === g ? 'var(--ve-purple)' : 'var(--ve-border)'}`,
                  background: genderFilter === g ? 'rgba(124,58,237,0.10)' : 'var(--ve-bg)',
                  color: genderFilter === g ? 'var(--ve-purple)' : 'var(--ve-text-3)',
                  fontSize: 12,
                  fontWeight: genderFilter === g ? 600 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      <p style={{ fontSize: 12, color: 'var(--ve-text-3)', marginBottom: 16 }}>
        Showing {filtered.length} coach{filtered.length !== 1 ? 'es' : ''}
      </p>

      {/* Coach grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((coach) => {
          const meta = categoryMeta[coach.category];
          return (
            <div
              key={coach.id}
              style={{
                background: 'var(--ve-surface)',
                border: '1px solid var(--ve-border)',
                borderRadius: 20,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 24px rgba(124,58,237,0.10)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <CoachAvatar name={coach.name} category={coach.category} size={52} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 2 }}>{coach.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ve-text-3)', marginBottom: 6, lineHeight: 1.4 }}>{coach.designation}</div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 9px',
                      borderRadius: 10,
                      background: `${meta.color}15`,
                      color: meta.color,
                      border: `1px solid ${meta.color}30`,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ve-text)' }}>{coach.rating}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{coach.sessions} sessions</span>
                <span style={{ fontSize: 12, color: 'var(--ve-text-3)' }}>{coach.experience}yr exp</span>
              </div>

              {/* Specialisations */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {coach.specialisations.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 10,
                      padding: '3px 9px',
                      borderRadius: 8,
                      background: 'var(--ve-bg)',
                      color: 'var(--ve-text-2)',
                      border: '1px solid var(--ve-border)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Price + CTA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>From </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ve-text)' }}>
                    ₹{coach.price.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ve-text-3)' }}>/mo</span>
                </div>
                <Link href={`/coaches/${coach.id}`} style={{ textDecoration: 'none' }}>
                  <button className="btn-secondary" style={{ height: 36, padding: '0 16px', fontSize: 12 }}>
                    View Profile
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ve-text-3)' }}>
          <Search size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--ve-text)', marginBottom: 8 }}>No coaches found</p>
          <p style={{ fontSize: 14 }}>Try adjusting your filters or search</p>
        </div>
      )}
    </div>
  );
}
