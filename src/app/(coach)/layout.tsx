'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CoachSidebar from '@/components/layout/CoachSidebar';
import { useAuthStore } from '@/stores/useAuthStore';

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, role } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn || role !== 'coach') router.replace('/login');
  }, [isLoggedIn, role, router]);

  if (!isLoggedIn || role !== 'coach') return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0F16' }}>
      <CoachSidebar />
      <main style={{ flex: 1, minHeight: '100vh', overflowY: 'auto' }} className="lg:ml-[240px]">
        {children}
      </main>
    </div>
  );
}
