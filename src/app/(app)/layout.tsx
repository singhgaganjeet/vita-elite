import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      <Sidebar />
      {/* Main content — padded on mobile so bottom nav doesn't cover content */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: '100vh',
        }}
        className="lg:ml-[240px]"
      >
        {/* Inner wrapper adds bottom padding only on mobile */}
        <div className="pb-[80px] lg:pb-0">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
