import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      {/* Desktop sidebar — hidden on mobile via className */}
      <Sidebar />

      {/* Main content */}
      <main
        style={{ flex: 1, minHeight: '100vh', overflowY: 'auto' }}
        className="lg:ml-[240px]"
      >
        {/* Mobile top header (logo bar) — hidden on desktop */}
        <MobileHeader />

        {/* Page content — extra bottom padding on mobile for the nav bar */}
        <div className="pb-[80px] lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <BottomNav />
    </div>
  );
}
