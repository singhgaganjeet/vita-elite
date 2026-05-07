import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface CoachBooking {
  id: string
  clientName: string
  clientEmail: string
  clientAvatar: string
  date: string
  time: string
  type: 'video' | 'in-person'
  status: BookingStatus
  amount: number
  notes: string
  sessionNumber: number
}

export interface CoachClient {
  id: string
  name: string
  email: string
  avatar: string
  goal: string
  joinedDate: string
  sessionsCompleted: number
  nextSession: string | null
  progress: 'on-track' | 'ahead' | 'behind'
  weight: number
  targetWeight: number
}

function d(daysOffset: number, timeStr = '10:00 AM'): { date: string; time: string } {
  const dt = new Date()
  dt.setDate(dt.getDate() + daysOffset)
  return { date: dt.toISOString().split('T')[0], time: timeStr }
}

function past(daysAgo: number, timeStr = '10:00 AM'): { date: string; time: string } {
  return d(-daysAgo, timeStr)
}

const SEED_BOOKINGS: CoachBooking[] = [
  { id: 'b1',  clientName: 'Riya Kapoor',    clientEmail: 'riya@email.com',   clientAvatar: 'RK', ...d(1,  '7:00 AM'),  type: 'video',     status: 'confirmed',  amount: 5000, notes: 'Focus on upper body strength',   sessionNumber: 6  },
  { id: 'b2',  clientName: 'Sameer Joshi',   clientEmail: 'sameer@email.com', clientAvatar: 'SJ', ...d(1,  '9:00 AM'),  type: 'in-person', status: 'confirmed',  amount: 5000, notes: 'Cardio assessment day',           sessionNumber: 3  },
  { id: 'b3',  clientName: 'Neha Gupta',     clientEmail: 'neha@email.com',   clientAvatar: 'NG', ...d(2,  '6:30 AM'),  type: 'video',     status: 'pending',    amount: 5000, notes: 'Onboarding session',              sessionNumber: 1  },
  { id: 'b4',  clientName: 'Vikram Singh',   clientEmail: 'vikram@email.com', clientAvatar: 'VS', ...d(3,  '8:00 AM'),  type: 'video',     status: 'confirmed',  amount: 5000, notes: 'HIIT programme — week 4',         sessionNumber: 4  },
  { id: 'b5',  clientName: 'Anjali Mehta',   clientEmail: 'anjali@email.com', clientAvatar: 'AM', ...d(4,  '7:30 AM'),  type: 'in-person', status: 'pending',    amount: 5000, notes: 'Strength assessment',             sessionNumber: 2  },
  { id: 'b6',  clientName: 'Riya Kapoor',    clientEmail: 'riya@email.com',   clientAvatar: 'RK', ...past(2, '7:00 AM'), type: 'video',    status: 'completed',  amount: 5000, notes: 'Core + flexibility',              sessionNumber: 5  },
  { id: 'b7',  clientName: 'Sameer Joshi',   clientEmail: 'sameer@email.com', clientAvatar: 'SJ', ...past(4, '9:00 AM'), type: 'in-person',status: 'completed',  amount: 5000, notes: 'Leg day — progressive overload',  sessionNumber: 2  },
  { id: 'b8',  clientName: 'Pooja Agarwal',  clientEmail: 'pooja@email.com',  clientAvatar: 'PA', ...past(5, '6:00 AM'), type: 'video',    status: 'cancelled',  amount: 5000, notes: 'Client no-show',                 sessionNumber: 3  },
  { id: 'b9',  clientName: 'Karan Malhotra', clientEmail: 'karan@email.com',  clientAvatar: 'KM', ...past(7, '8:00 AM'), type: 'video',    status: 'completed',  amount: 5000, notes: 'Fat loss programme — check-in',   sessionNumber: 8  },
  { id: 'b10', clientName: 'Divya Nair',     clientEmail: 'divya@email.com',  clientAvatar: 'DN', ...past(9, '7:00 AM'), type: 'in-person',status: 'completed',  amount: 5000, notes: 'Posture correction session',      sessionNumber: 4  },
  { id: 'b11', clientName: 'Vikram Singh',   clientEmail: 'vikram@email.com', clientAvatar: 'VS', ...past(10,'8:00 AM'), type: 'video',    status: 'completed',  amount: 5000, notes: 'HIIT — week 3',                  sessionNumber: 3  },
  { id: 'b12', clientName: 'Anjali Mehta',   clientEmail: 'anjali@email.com', clientAvatar: 'AM', ...past(12,'7:30 AM'), type: 'in-person',status: 'completed',  amount: 5000, notes: 'Goal setting + baseline test',   sessionNumber: 1  },
]

const SEED_CLIENTS: CoachClient[] = [
  { id: 'c1', name: 'Riya Kapoor',    email: 'riya@email.com',   avatar: 'RK', goal: 'Weight Loss',    joinedDate: '2024-11-10', sessionsCompleted: 6,  nextSession: d(1).date, progress: 'on-track', weight: 68,  targetWeight: 60 },
  { id: 'c2', name: 'Sameer Joshi',   email: 'sameer@email.com', avatar: 'SJ', goal: 'Build Strength', joinedDate: '2024-12-01', sessionsCompleted: 3,  nextSession: d(1).date, progress: 'ahead',    weight: 78,  targetWeight: 85 },
  { id: 'c3', name: 'Neha Gupta',     email: 'neha@email.com',   avatar: 'NG', goal: 'Weight Loss',    joinedDate: '2025-01-15', sessionsCompleted: 0,  nextSession: d(2).date, progress: 'on-track', weight: 72,  targetWeight: 62 },
  { id: 'c4', name: 'Vikram Singh',   email: 'vikram@email.com', avatar: 'VS', goal: 'Athletic Perf.', joinedDate: '2024-10-20', sessionsCompleted: 4,  nextSession: d(3).date, progress: 'ahead',    weight: 82,  targetWeight: 80 },
  { id: 'c5', name: 'Anjali Mehta',   email: 'anjali@email.com', avatar: 'AM', goal: 'Toning',         joinedDate: '2025-01-05', sessionsCompleted: 2,  nextSession: d(4).date, progress: 'on-track', weight: 62,  targetWeight: 58 },
  { id: 'c6', name: 'Karan Malhotra', email: 'karan@email.com',  avatar: 'KM', goal: 'Fat Loss',       joinedDate: '2024-09-12', sessionsCompleted: 8,  nextSession: null,      progress: 'on-track', weight: 92,  targetWeight: 80 },
  { id: 'c7', name: 'Divya Nair',     email: 'divya@email.com',  avatar: 'DN', goal: 'Posture Corr.',  joinedDate: '2024-10-30', sessionsCompleted: 4,  nextSession: null,      progress: 'behind',   weight: 58,  targetWeight: 58 },
  { id: 'c8', name: 'Pooja Agarwal',  email: 'pooja@email.com',  avatar: 'PA', goal: 'General Fit.',   joinedDate: '2024-12-20', sessionsCompleted: 2,  nextSession: null,      progress: 'behind',   weight: 65,  targetWeight: 60 },
]

// Monthly revenue for past 6 months
export const REVENUE_DATA = [
  { month: 'Dec', revenue: 35000, sessions: 7  },
  { month: 'Jan', revenue: 40000, sessions: 8  },
  { month: 'Feb', revenue: 38000, sessions: 7  },
  { month: 'Mar', revenue: 45000, sessions: 9  },
  { month: 'Apr', revenue: 42000, sessions: 8  },
  { month: 'May', revenue: 50000, sessions: 10 },
]

interface CoachPortalStore {
  bookings: CoachBooking[]
  clients: CoachClient[]
  updateBookingStatus: (id: string, status: BookingStatus) => void
  addBookingNote: (id: string, note: string) => void
}

export const useCoachPortalStore = create<CoachPortalStore>()(
  persist(
    (set) => ({
      bookings: SEED_BOOKINGS,
      clients: SEED_CLIENTS,

      updateBookingStatus: (id, status) =>
        set(s => ({ bookings: s.bookings.map(b => b.id === id ? { ...b, status } : b) })),

      addBookingNote: (id, note) =>
        set(s => ({ bookings: s.bookings.map(b => b.id === id ? { ...b, notes: note } : b) })),
    }),
    { name: 'vita-coach-portal' }
  )
)
