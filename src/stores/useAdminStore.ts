import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserStatus = 'active' | 'inactive' | 'suspended'
export type CoachApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface AdminUser {
  id: string
  name: string
  email: string
  avatar: string
  city: string
  goal: string
  joinedDate: string
  status: UserStatus
  sessionsBooked: number
  lastActive: string
}

export interface CoachApplication {
  id: string
  name: string
  email: string
  avatar: string
  category: 'fitness' | 'diet' | 'physio'
  city: string
  experience: number
  certifications: string[]
  bio: string
  appliedDate: string
  status: CoachApplicationStatus
}

function ago(days: number): string {
  const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().split('T')[0]
}

const SEED_USERS: AdminUser[] = [
  { id: 'u1',  name: 'Priya Sharma',    email: 'demo@vitaelite.com',    avatar: 'PS', city: 'Mumbai',       goal: 'Weight Loss',     joinedDate: ago(120), status: 'active',   sessionsBooked: 8,  lastActive: ago(0)  },
  { id: 'u2',  name: 'Rohan Verma',     email: 'rohan@email.com',       avatar: 'RV', city: 'Delhi NCR',    goal: 'Build Strength',  joinedDate: ago(98),  status: 'active',   sessionsBooked: 5,  lastActive: ago(1)  },
  { id: 'u3',  name: 'Sneha Patel',     email: 'sneha@email.com',       avatar: 'SP', city: 'Ahmedabad',    goal: 'Weight Loss',     joinedDate: ago(85),  status: 'active',   sessionsBooked: 3,  lastActive: ago(2)  },
  { id: 'u4',  name: 'Aditya Kumar',    email: 'aditya@email.com',      avatar: 'AK', city: 'Bengaluru',    goal: 'Athletic Perf.',  joinedDate: ago(74),  status: 'active',   sessionsBooked: 12, lastActive: ago(0)  },
  { id: 'u5',  name: 'Meena Iyer',      email: 'meena@email.com',       avatar: 'MI', city: 'Chennai',      goal: 'General Fitness', joinedDate: ago(65),  status: 'active',   sessionsBooked: 4,  lastActive: ago(3)  },
  { id: 'u6',  name: 'Kabir Malhotra',  email: 'kabir@email.com',       avatar: 'KM', city: 'Hyderabad',    goal: 'Weight Loss',     joinedDate: ago(60),  status: 'active',   sessionsBooked: 2,  lastActive: ago(5)  },
  { id: 'u7',  name: 'Tanya Bose',      email: 'tanya@email.com',       avatar: 'TB', city: 'Kolkata',      goal: 'Toning',          joinedDate: ago(55),  status: 'active',   sessionsBooked: 6,  lastActive: ago(1)  },
  { id: 'u8',  name: 'Nikhil Chopra',   email: 'nikhil@email.com',      avatar: 'NC', city: 'Pune',         goal: 'Build Strength',  joinedDate: ago(48),  status: 'inactive', sessionsBooked: 1,  lastActive: ago(20) },
  { id: 'u9',  name: 'Pooja Reddy',     email: 'pooja@email.com',       avatar: 'PR', city: 'Bengaluru',    goal: 'Weight Loss',     joinedDate: ago(40),  status: 'active',   sessionsBooked: 7,  lastActive: ago(2)  },
  { id: 'u10', name: 'Aryan Saxena',    email: 'aryan@email.com',       avatar: 'AS', city: 'Jaipur',       goal: 'Fat Loss',        joinedDate: ago(35),  status: 'active',   sessionsBooked: 3,  lastActive: ago(4)  },
  { id: 'u11', name: 'Divya Menon',     email: 'divya@email.com',       avatar: 'DM', city: 'Kochi',        goal: 'Flexibility',     joinedDate: ago(30),  status: 'active',   sessionsBooked: 2,  lastActive: ago(0)  },
  { id: 'u12', name: 'Siddharth Rao',   email: 'sid@email.com',         avatar: 'SR', city: 'Hyderabad',    goal: 'Build Strength',  joinedDate: ago(25),  status: 'suspended',sessionsBooked: 0,  lastActive: ago(25) },
  { id: 'u13', name: 'Kritika Nair',    email: 'kritika@email.com',     avatar: 'KN', city: 'Mumbai',       goal: 'Weight Loss',     joinedDate: ago(22),  status: 'active',   sessionsBooked: 1,  lastActive: ago(1)  },
  { id: 'u14', name: 'Rahul Shetty',    email: 'rahul2@email.com',      avatar: 'RS', city: 'Delhi NCR',    goal: 'Athletic Perf.',  joinedDate: ago(18),  status: 'active',   sessionsBooked: 4,  lastActive: ago(3)  },
  { id: 'u15', name: 'Anjali Tripathi', email: 'anjali2@email.com',     avatar: 'AT', city: 'Lucknow',      goal: 'General Fitness', joinedDate: ago(14),  status: 'active',   sessionsBooked: 0,  lastActive: ago(7)  },
  { id: 'u16', name: 'Vivek Jain',      email: 'vivek@email.com',       avatar: 'VJ', city: 'Indore',       goal: 'Weight Loss',     joinedDate: ago(10),  status: 'active',   sessionsBooked: 0,  lastActive: ago(10) },
  { id: 'u17', name: 'Shruti Pillai',   email: 'shruti@email.com',      avatar: 'SP', city: 'Pune',         goal: 'Toning',          joinedDate: ago(8),   status: 'active',   sessionsBooked: 2,  lastActive: ago(2)  },
  { id: 'u18', name: 'Dev Khanna',      email: 'dev@email.com',         avatar: 'DK', city: 'Chandigarh',   goal: 'Build Strength',  joinedDate: ago(5),   status: 'active',   sessionsBooked: 0,  lastActive: ago(5)  },
  { id: 'u19', name: 'Mira Shah',       email: 'mira@email.com',        avatar: 'MS', city: 'Surat',        goal: 'Weight Loss',     joinedDate: ago(3),   status: 'active',   sessionsBooked: 1,  lastActive: ago(3)  },
  { id: 'u20', name: 'Aman Trivedi',    email: 'aman@email.com',        avatar: 'AT', city: 'Bhopal',       goal: 'General Fitness', joinedDate: ago(1),   status: 'active',   sessionsBooked: 0,  lastActive: ago(1)  },
]

const SEED_APPLICATIONS: CoachApplication[] = [
  {
    id: 'ca1', name: 'Ishaan Bhatia', email: 'ishaan@email.com', avatar: 'IB',
    category: 'fitness', city: 'Gurugram', experience: 4,
    certifications: ['ACE CPT', 'CrossFit Level 1'],
    bio: 'CrossFit specialist with 4 years of experience training corporate professionals. Passionate about functional fitness and helping busy people stay fit despite demanding schedules.',
    appliedDate: ago(2), status: 'pending',
  },
  {
    id: 'ca2', name: 'Leena Mathur', email: 'leena@email.com', avatar: 'LM',
    category: 'diet', city: 'Jaipur', experience: 6,
    certifications: ['Registered Dietitian', 'Sports Nutrition Specialist'],
    bio: 'Registered dietitian focusing on sports nutrition and weight management. 6 years helping athletes and fitness enthusiasts optimise performance through evidence-based dietary interventions.',
    appliedDate: ago(5), status: 'pending',
  },
  {
    id: 'ca3', name: 'Prakash Nambiar', email: 'prakash@email.com', avatar: 'PN',
    category: 'physio', city: 'Kochi', experience: 8,
    certifications: ['BPT', 'Sports Physiotherapy Cert.', 'Manual Therapy Level 2'],
    bio: 'Sports physiotherapist with 8 years treating athletes and active individuals. Specialises in injury rehabilitation, movement assessment, and return-to-sport programmes.',
    appliedDate: ago(7), status: 'pending',
  },
]

// Platform growth data (last 6 months)
export const PLATFORM_GROWTH = [
  { month: 'Dec', users: 820,  coaches: 24, sessions: 1120, revenue: 560000  },
  { month: 'Jan', users: 940,  coaches: 26, sessions: 1280, revenue: 640000  },
  { month: 'Feb', users: 1010, coaches: 27, sessions: 1190, revenue: 595000  },
  { month: 'Mar', users: 1090, coaches: 28, sessions: 1420, revenue: 710000  },
  { month: 'Apr', users: 1180, coaches: 29, sessions: 1350, revenue: 675000  },
  { month: 'May', users: 1247, coaches: 30, sessions: 1560, revenue: 780000  },
]

interface AdminStore {
  users: AdminUser[]
  applications: CoachApplication[]
  updateUserStatus: (id: string, status: UserStatus) => void
  updateApplicationStatus: (id: string, status: CoachApplicationStatus) => void
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      users: SEED_USERS,
      applications: SEED_APPLICATIONS,

      updateUserStatus: (id, status) =>
        set(s => ({ users: s.users.map(u => u.id === id ? { ...u, status } : u) })),

      updateApplicationStatus: (id, status) =>
        set(s => ({ applications: s.applications.map(a => a.id === id ? { ...a, status } : a) })),
    }),
    { name: 'vita-admin' }
  )
)
