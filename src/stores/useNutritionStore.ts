import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

export interface FoodEntry {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fibre: number
  quantity: number
  unit: string
  addedAt: string
}

export interface DayLog {
  date: string
  meals: {
    Breakfast: FoodEntry[]
    Lunch: FoodEntry[]
    Dinner: FoodEntry[]
    Snacks: FoodEntry[]
  }
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function pastDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

function makeEntry(
  id: string,
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fats: number,
  fibre: number,
  quantity: number,
  unit: string
): FoodEntry {
  return { id, name, calories, protein, carbs, fats, fibre, quantity, unit, addedAt: new Date().toISOString() }
}

// Seed today's meals
const seedToday: DayLog = {
  date: today(),
  meals: {
    Breakfast: [
      makeEntry('b1', 'Masala Oats', 156, 6, 26, 3, 4, 1, 'bowl'),
      makeEntry('b2', 'Boiled Egg', 78, 6, 0.6, 5, 0, 2, 'egg'),
    ],
    Lunch: [
      makeEntry('l1', 'Rajma Chawal', 360, 14, 68, 3, 8, 1, 'plate'),
      makeEntry('l2', 'Curd (Dahi)', 61, 3.5, 4.7, 3.3, 0, 1, 'cup'),
    ],
    Dinner: [],
    Snacks: [
      makeEntry('s1', 'Banana', 89, 1.1, 23, 0.3, 2.6, 1, 'piece'),
    ],
  },
}

// Seed weekly calorie history (past 6 days, today is live)
function seedWeeklyHistory(): Record<string, DayLog> {
  const history: Record<string, DayLog> = {}
  const calorieSeed = [2050, 1920, 2180, 1850, 2090, 1760]
  for (let i = 1; i <= 6; i++) {
    const date = pastDate(i)
    const cal = calorieSeed[i - 1]
    // Distribute calories roughly across meals
    history[date] = {
      date,
      meals: {
        Breakfast: [makeEntry(`h-b-${i}`, 'Breakfast items', Math.round(cal * 0.25), Math.round(cal * 0.25 / 17), Math.round(cal * 0.25 / 17), Math.round(cal * 0.25 / 40), 3, 1, 'serving')],
        Lunch: [makeEntry(`h-l-${i}`, 'Lunch items', Math.round(cal * 0.35), Math.round(cal * 0.35 / 17), Math.round(cal * 0.35 / 17), Math.round(cal * 0.35 / 40), 5, 1, 'serving')],
        Dinner: [makeEntry(`h-d-${i}`, 'Dinner items', Math.round(cal * 0.3), Math.round(cal * 0.3 / 17), Math.round(cal * 0.3 / 17), Math.round(cal * 0.3 / 40), 4, 1, 'serving')],
        Snacks: [makeEntry(`h-s-${i}`, 'Snack', Math.round(cal * 0.1), Math.round(cal * 0.1 / 17), Math.round(cal * 0.1 / 17), Math.round(cal * 0.1 / 40), 1, 1, 'serving')],
      },
    }
  }
  return history
}

interface NutritionStore {
  logs: Record<string, DayLog>
  getTodayLog: () => DayLog
  addFoodEntry: (meal: MealType, entry: Omit<FoodEntry, 'id' | 'addedAt'>) => void
  removeFoodEntry: (meal: MealType, id: string) => void
  getTodayTotals: () => { calories: number; protein: number; carbs: number; fats: number; fibre: number }
  getWeeklyData: () => { day: string; calories: number; goal: number }[]
}

export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set, get) => ({
      logs: {
        [today()]: seedToday,
        ...seedWeeklyHistory(),
      },

      getTodayLog: () => {
        const { logs } = get()
        const date = today()
        if (!logs[date]) {
          return {
            date,
            meals: { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] },
          }
        }
        return logs[date]
      },

      addFoodEntry: (meal, entry) => {
        const date = today()
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const fullEntry: FoodEntry = { ...entry, id, addedAt: new Date().toISOString() }
        set((state) => {
          const existing = state.logs[date] ?? {
            date,
            meals: { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] },
          }
          return {
            logs: {
              ...state.logs,
              [date]: {
                ...existing,
                meals: {
                  ...existing.meals,
                  [meal]: [...existing.meals[meal], fullEntry],
                },
              },
            },
          }
        })
      },

      removeFoodEntry: (meal, id) => {
        const date = today()
        set((state) => {
          const existing = state.logs[date]
          if (!existing) return state
          return {
            logs: {
              ...state.logs,
              [date]: {
                ...existing,
                meals: {
                  ...existing.meals,
                  [meal]: existing.meals[meal].filter((e) => e.id !== id),
                },
              },
            },
          }
        })
      },

      getTodayTotals: () => {
        const log = get().getTodayLog()
        let calories = 0, protein = 0, carbs = 0, fats = 0, fibre = 0
        const meals: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
        meals.forEach((meal) => {
          log.meals[meal].forEach((e) => {
            calories += e.calories * e.quantity
            protein += e.protein * e.quantity
            carbs += e.carbs * e.quantity
            fats += e.fats * e.quantity
            fibre += e.fibre * e.quantity
          })
        })
        return {
          calories: Math.round(calories),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fats: Math.round(fats),
          fibre: Math.round(fibre),
        }
      },

      getWeeklyData: () => {
        const { logs } = get()
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const result = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]
          const dayName = days[d.getDay()]
          const log = logs[dateStr]
          let cal = 0
          if (log) {
            const meals: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
            meals.forEach((meal) => {
              log.meals[meal].forEach((e) => { cal += e.calories * e.quantity })
            })
          }
          result.push({ day: dayName, calories: Math.round(cal), goal: 1800 })
        }
        return result
      },
    }),
    { name: 'vita-elite-nutrition' }
  )
)
