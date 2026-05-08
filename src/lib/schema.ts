import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ─── Auth (Lucia) ────────────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['user', 'coach', 'admin'] }).notNull().default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
});

// ─── User Profiles ────────────────────────────────────────────────────────────

export const userProfiles = sqliteTable('user_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  age: integer('age'),
  gender: text('gender'),
  heightCm: real('height_cm'),
  weightKg: real('weight_kg'),
  goalWeightKg: real('goal_weight_kg'),
  activityLevel: text('activity_level'),
  primaryGoal: text('primary_goal'),
  dietaryPreference: text('dietary_preference'),
  medicalConditions: text('medical_conditions'), // JSON array stored as text
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ─── Body Measurements ────────────────────────────────────────────────────────

export const bodyMeasurements = sqliteTable('body_measurements', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // ISO date string YYYY-MM-DD
  weightKg: real('weight_kg'),
  bodyFatPct: real('body_fat_pct'),
  muscleMassPct: real('muscle_mass_pct'),
  waistCm: real('waist_cm'),
  hipCm: real('hip_cm'),
  chestCm: real('chest_cm'),
  armCm: real('arm_cm'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ─── Nutrition Logs ───────────────────────────────────────────────────────────

export const nutritionLogs = sqliteTable('nutrition_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD
  meal: text('meal', { enum: ['breakfast', 'lunch', 'dinner', 'snacks'] }).notNull(),
  name: text('name').notNull(),
  calories: real('calories').notNull(),
  protein: real('protein').notNull().default(0),
  carbs: real('carbs').notNull().default(0),
  fat: real('fat').notNull().default(0),
  portionGrams: real('portion_grams'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ─── Coach Profiles ───────────────────────────────────────────────────────────

export const coachProfiles = sqliteTable('coach_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  tagline: text('tagline'),
  specialization: text('specialization'),
  experience: integer('experience'), // years
  pricePerSession: real('price_per_session'),
  availability: text('availability'), // JSON array of days
  rating: real('rating').default(0),
  reviewCount: integer('review_count').default(0),
  totalSessions: integer('total_sessions').default(0),
  isApproved: integer('is_approved', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  coachId: text('coach_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  time: text('time').notNull(),
  duration: integer('duration').notNull().default(60), // minutes
  status: text('status', { enum: ['pending', 'confirmed', 'completed', 'cancelled'] }).notNull().default('pending'),
  notes: text('notes'),
  amount: real('amount'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
