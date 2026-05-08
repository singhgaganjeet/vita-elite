'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ve-bg)' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

      {/* Re-open button — desktop only, shown when sidebar is collapsed */}
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

      <BottomNav />
    </div>
  );
}
