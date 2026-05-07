import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: '100vh',
        }}
        className="lg:ml-[240px] pb-20 lg:pb-0"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
