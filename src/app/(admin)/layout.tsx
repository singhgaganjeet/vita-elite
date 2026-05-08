'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminBottomNav from '@/components/layout/AdminBottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, role } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || role !== 'admin') router.replace('/login');
  }, [isLoggedIn, role, router]);

  if (!isLoggedIn || role !== 'admin') return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ve-bg)' }}>
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          title="Open sidebar"
          className="hidden lg:flex"
          style={{
            position: 'fixed', top: 20, left: 16, zIndex: 50,
            width: 36, height: 36, borderRadius: 10,
            background: '#FFFFFF', border: '1px solid var(--ve-border)',
            boxShadow: '0 2px 12px rgba(124,58,237,0.12)',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--ve-purple)',
          }}
        >
          <Menu size={18} />
        </button>
      )}

      <main
        className={sidebarOpen ? 'sidebar-content' : ''}
        style={{ flex: 1, minHeight: '100vh', overflowY: 'auto', transition: 'margin-left 0.25s ease' }}
      >
        <MobileHeader />
        <div className="page-content">{children}</div>
      </main>

      <AdminBottomNav />
    </div>
  );
}
