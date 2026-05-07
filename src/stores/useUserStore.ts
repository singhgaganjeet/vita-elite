import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  name: string
  email: string
  age: number
  dob: string
  sex: 'male' | 'female' | 'prefer-not-to-say'
  city: string
  state: string
  phone: string
  weight: number   // kg
  height: number   // cm
  activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active'
  goals: string[]
  onboardingComplete: boolean
}

export interface Measurement {
  value: number
  date: string
  measuredBy: 'self' | string
}

export interface BodyMeasurements {
  weight: Measurement[]
  height: Measurement[]
  bicepsLeft: Measurement[]
  bicepsRight: Measurement[]
  forearmsLeft: Measurement[]
  forearmsRight: Measurement[]
  upperArms: Measurement[]
  wrist: Measurement[]
  neck: Measurement[]
  shoulders: Measurement[]
  chest: Measurement[]
  waist: Measurement[]
  hips: Measurement[]
  thighLeft: Measurement[]
  thighRight: Measurement[]
  calfLeft: Measurement[]
  calfRight: Measurement[]
  knee: Measurement[]
  armLengthLeft: Measurement[]
  armLengthRight: Measurement[]
  legLengthLeft: Measurement[]
  legLengthRight: Measurement[]
}

// Generate 30-day weight seed data trending from 68kg down to 65kg
function generateWeightHistory(): Measurement[] {
  const today = new Date()
  const entries: Measurement[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    // Trend: start at 68, end at 65, with some noise
    const baseWeight = 68 - ((29 - i) / 29) * 3
    const noise = (Math.sin(i * 1.3) * 0.25 + Math.cos(i * 0.7) * 0.15)
    const value = Math.round((baseWeight + noise) * 10) / 10
    entries.push({ value, date: dateStr, measuredBy: 'self' })
  }
  return entries
}

function seedDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Priya Sharma',
  email: 'demo@vitaelite.com',
  age: 28,
  dob: '1997-03-15',
  sex: 'female',
  city: 'Mumbai',
  state: 'Maharashtra',
  phone: '+91 98765 43210',
  weight: 65,
  height: 165,
  activityLevel: 'lightly-active',
  goals: ['Weight Loss', 'Build Strength'],
  onboardingComplete: true,
}

const DEFAULT_MEASUREMENTS: BodyMeasurements = {
  weight: generateWeightHistory(),
  height: [{ value: 165, date: seedDate(30), measuredBy: 'self' }],
  bicepsLeft: [{ value: 28, date: seedDate(14), measuredBy: 'self' }],
  bicepsRight: [{ value: 28.5, date: seedDate(14), measuredBy: 'self' }],
  forearmsLeft: [{ value: 22, date: seedDate(14), measuredBy: 'self' }],
  forearmsRight: [{ value: 22.5, date: seedDate(14), measuredBy: 'self' }],
  upperArms: [{ value: 28, date: seedDate(14), measuredBy: 'self' }],
  wrist: [{ value: 15.5, date: seedDate(30), measuredBy: 'self' }],
  neck: [{ value: 33, date: seedDate(30), measuredBy: 'self' }],
  shoulders: [{ value: 108, date: seedDate(7), measuredBy: 'self' }],
  chest: [{ value: 88, date: seedDate(7), measuredBy: 'self' }],
  waist: [{ value: 73, date: seedDate(7), measuredBy: 'self' }],
  hips: [{ value: 94, date: seedDate(7), measuredBy: 'self' }],
  thighLeft: [{ value: 56, date: seedDate(14), measuredBy: 'self' }],
  thighRight: [{ value: 56.5, date: seedDate(14), measuredBy: 'self' }],
  calfLeft: [{ value: 35, date: seedDate(14), measuredBy: 'self' }],
  calfRight: [{ value: 35.5, date: seedDate(14), measuredBy: 'self' }],
  knee: [{ value: 38, date: seedDate(30), measuredBy: 'self' }],
  armLengthLeft: [{ value: 58, date: seedDate(30), measuredBy: 'self' }],
  armLengthRight: [{ value: 58, date: seedDate(30), measuredBy: 'self' }],
  legLengthLeft: [{ value: 88, date: seedDate(30), measuredBy: 'self' }],
  legLengthRight: [{ value: 88, date: seedDate(30), measuredBy: 'self' }],
}

interface UserStore {
  profile: UserProfile
  measurements: BodyMeasurements
  savedProducts: string[]
  setProfile: (updates: Partial<UserProfile>) => void
  addMeasurement: (key: keyof BodyMeasurements, value: number) => void
  saveProduct: (productName: string) => void
  getDailyCalorieGoal: () => number
  getBMI: () => number
  logout: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      measurements: DEFAULT_MEASUREMENTS,
      savedProducts: [],

      setProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),

      addMeasurement: (key, value) => {
        const today = new Date().toISOString().split('T')[0]
        set((state) => ({
          measurements: {
            ...state.measurements,
            [key]: [
              ...state.measurements[key],
              { value, date: today, measuredBy: 'self' },
            ],
          },
        }))
      },

      saveProduct: (productName) =>
        set((state) => ({
          savedProducts: state.savedProducts.includes(productName)
            ? state.savedProducts
            : [...state.savedProducts, productName],
        })),

      logout: () => {
        set({ profile: DEFAULT_PROFILE, measurements: DEFAULT_MEASUREMENTS, savedProducts: [] })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('vita-user')
          localStorage.removeItem('vita-nutrition')
          localStorage.removeItem('vita-activity')
        }
      },

      getDailyCalorieGoal: () => {
        const { profile } = get()
        const { weight, height, age, sex, activityLevel, goals } = profile
        const bmr =
          sex === 'female'
            ? 10 * weight + 6.25 * height - 5 * age - 161
            : 10 * weight + 6.25 * height - 5 * age + 5

        const multipliers: Record<string, number> = {
          sedentary: 1.2,
          'lightly-active': 1.375,
          'moderately-active': 1.55,
          'very-active': 1.725,
          'extremely-active': 1.9,
        }
        const tdee = bmr * (multipliers[activityLevel] ?? 1.375)

        let adjustment = 0
        if (goals.includes('Weight Loss')) adjustment = -500
        else if (goals.includes('Weight Gain')) adjustment = 300

        return Math.round(tdee + adjustment)
      },

      getBMI: () => {
        const { weight, height } = get().profile
        return Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10
      },
    }),
    {
      name: 'vita-elite-user',
    }
  )
)
