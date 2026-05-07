'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, role } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn || role !== 'admin') router.replace('/login');
  }, [isLoggedIn, role, router]);

  if (!isLoggedIn || role !== 'admin') return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08060F' }}>
      <AdminSidebar />
      <main style={{ flex: 1, minHeight: '100vh', overflowY: 'auto' }} className="lg:ml-[240px]">
        {children}
      </main>
    </div>
  );
}
