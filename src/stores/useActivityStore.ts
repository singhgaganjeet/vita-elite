import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WorkoutEntry {
  id: string
  type: string
  duration: number        // minutes
  intensity: 'low' | 'medium' | 'high'
  caloriesBurned: number
  time: string
}

export interface ActivityLog {
  date: string
  steps: number
  activeMinutes: number
  caloriesBurned: number
  workouts: WorkoutEntry[]
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function pastDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

// Calorie burn rate per minute by intensity (kcal/min)
const intensityRate: Record<'low' | 'medium' | 'high', number> = {
  low: 4,
  medium: 7,
  high: 11,
}

// Seed 7 days of activity (steps ranging 4000-9000)
function seedActivityHistory(): Record<string, ActivityLog> {
  const history: Record<string, ActivityLog> = {}
  const stepSeed = [6200, 4800, 8700, 5300, 7900, 4200, 6800]
  for (let i = 1; i <= 7; i++) {
    const date = pastDate(i)
    const steps = stepSeed[i - 1]
    const activeMinutes = Math.round(steps / 110)
    const caloriesBurned = Math.round(steps * 0.04)
    history[date] = {
      date,
      steps,
      activeMinutes,
      caloriesBurned,
      workouts: i % 3 === 0
        ? [{
            id: `w-seed-${i}`,
            type: i % 2 === 0 ? 'Yoga' : 'Walking',
            duration: 30,
            intensity: 'low',
            caloriesBurned: 120,
            time: '07:30',
          }]
        : [],
    }
  }
  return history
}

interface ActivityStore {
  logs: Record<string, ActivityLog>
  getTodayActivity: () => ActivityLog
  setSteps: (steps: number) => void
  addWorkout: (entry: Omit<WorkoutEntry, 'id'>) => void
  getWeeklySteps: () => { day: string; steps: number }[]
  getWeeklyCaloriesBurned: () => { day: string; calories: number }[]
}

const DEFAULT_TODAY: ActivityLog = {
  date: today(),
  steps: 6240,
  activeMinutes: 52,
  caloriesBurned: 250,
  workouts: [],
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      logs: {
        [today()]: DEFAULT_TODAY,
        ...seedActivityHistory(),
      },

      getTodayActivity: () => {
        const { logs } = get()
        const date = today()
        return logs[date] ?? { date, steps: 0, activeMinutes: 0, caloriesBurned: 0, workouts: [] }
      },

      setSteps: (steps) => {
        const date = today()
        set((state) => {
          const existing = state.logs[date] ?? { date, steps: 0, activeMinutes: 0, caloriesBurned: 0, workouts: [] }
          const caloriesBurned = Math.round(steps * 0.04) + existing.workouts.reduce((sum, w) => sum + w.caloriesBurned, 0)
          return {
            logs: {
              ...state.logs,
              [date]: {
                ...existing,
                steps,
                activeMinutes: Math.round(steps / 110),
                caloriesBurned,
              },
            },
          }
        })
      },

      addWorkout: (entry) => {
        const date = today()
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const workout: WorkoutEntry = { ...entry, id }
        set((state) => {
          const existing = state.logs[date] ?? { date, steps: 0, activeMinutes: 0, caloriesBurned: 0, workouts: [] }
          const workoutCals = entry.caloriesBurned > 0
            ? entry.caloriesBurned
            : Math.round(intensityRate[entry.intensity] * entry.duration)
          const updatedWorkout = { ...workout, caloriesBurned: workoutCals }
          const newWorkouts = [...existing.workouts, updatedWorkout]
          const totalWorkoutCals = newWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0)
          const stepCals = Math.round(existing.steps * 0.04)
          return {
            logs: {
              ...state.logs,
              [date]: {
                ...existing,
                workouts: newWorkouts,
                caloriesBurned: stepCals + totalWorkoutCals,
                activeMinutes: existing.activeMinutes + entry.duration,
              },
            },
          }
        })
      },

      getWeeklySteps: () => {
        const { logs } = get()
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const result = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]
          const dayName = days[d.getDay()]
          result.push({ day: dayName, steps: logs[dateStr]?.steps ?? 0 })
        }
        return result
      },

      getWeeklyCaloriesBurned: () => {
        const { logs } = get()
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const result = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]
          const dayName = days[d.getDay()]
          result.push({ day: dayName, calories: logs[dateStr]?.caloriesBurned ?? 0 })
        }
        return result
      },
    }),
    { name: 'vita-elite-activity' }
  )
)

export { intensityRate }
