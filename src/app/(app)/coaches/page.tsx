'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star, Filter } from 'lucide-react';
import CoachAvatar from '@/components/ui/CoachAvatar';
import { coaches, CoachCategory } from '@/data/coaches';

type SortKey = 'rating' | 'experience' | 'priceLow' | 'priceHigh';

const categoryMeta: Record<string, { label: string; color: string }> = {
  fitness: { label: 'Fitness', color: '#22C55E' },
  diet: { label: 'Diet', color: '#F5C518' },
  physio: { label: 'Physiotherapy', color: '#3B82F6' },
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
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Find a Coach</h1>
      <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 24 }}>
        {coaches.length} verified experts ready to come to you
      </p>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {([['all', 'All', '#FFFFFF'], ['fitness', 'Fitness', '#22C55E'], ['diet', 'Diet', '#F5C518'], ['physio', 'Physiotherapy', '#3B82F6']] as const).map(([key, label, color]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: 20,
              border: `1.5px solid ${category === key ? color : '#2E2E2E'}`,
              background: category === key ? `${color}18` : '#1A1A1A',
              color: category === key ? color : '#A0A0A0',
              fontSize: 13,
              fontWeight: category === key ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {label} <span style={{ opacity: 0.7 }}>({counts[key]})</span>
          </button>
        ))}
      </div>

      {/* Search + Sort + Filter row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} color="#A0A0A0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
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
            background: showFilters ? 'rgba(34,197,94,0.15)' : '#242424',
            border: `1px solid ${showFilters ? 'rgba(34,197,94,0.4)' : '#2E2E2E'}`,
            color: showFilters ? '#22C55E' : '#A0A0A0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Filter sidebar / panel */}
      {showFilters && (
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2E2E2E',
            borderRadius: 16,
            padding: '20px',
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
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
                  border: `1px solid ${genderFilter === g ? '#22C55E' : '#2E2E2E'}`,
                  background: genderFilter === g ? 'rgba(34,197,94,0.15)' : '#242424',
                  color: genderFilter === g ? '#22C55E' : '#A0A0A0',
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
      <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 16 }}>
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
                background: '#1A1A1A',
                border: '1px solid #2E2E2E',
                borderRadius: 20,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                transition: 'border-color 0.2s',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <CoachAvatar name={coach.name} category={coach.category} size={52} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>{coach.name}</div>
                  <div style={{ fontSize: 11, color: '#A0A0A0', marginBottom: 6, lineHeight: 1.4 }}>{coach.designation}</div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 9px',
                      borderRadius: 10,
                      background: `${meta.color}18`,
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={12} color="#F5C518" fill="#F5C518" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{coach.rating}</span>
                </div>
                <span style={{ fontSize: 12, color: '#A0A0A0' }}>{coach.sessions} sessions</span>
                <span style={{ fontSize: 12, color: '#A0A0A0' }}>{coach.experience}yr exp</span>
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
                      background: '#242424',
                      color: '#A0A0A0',
                      border: '1px solid #2E2E2E',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Price + CTA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: 11, color: '#A0A0A0' }}>From </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>
                    ₹{coach.price.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: 11, color: '#A0A0A0' }}>/mo</span>
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
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A0A0A0' }}>
          <Search size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', marginBottom: 8 }}>No coaches found</p>
          <p style={{ fontSize: 14 }}>Try adjusting your filters or search</p>
        </div>
      )}
    </div>
  );
}
