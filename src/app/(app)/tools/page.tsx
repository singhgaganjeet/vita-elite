import Link from 'next/link';
import { Calculator, Camera, ScanLine } from 'lucide-react';

const tools = [
  {
    icon: <Calculator size={32} color="#7C3AED" />,
    title: 'BMI Calculator',
    description:
      'Calculate your Body Mass Index instantly. Get your ideal weight range, health category, and personalised recommendations.',
    href: '/tools/bmi',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.20)',
  },
  {
    icon: <Camera size={32} color="#F59E0B" />,
    title: 'Food Scanner',
    description:
      'Point your camera at any dish and get instant nutritional breakdown. Powered by AI food recognition technology.',
    href: '/tools/food-scanner',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.20)',
  },
  {
    icon: <ScanLine size={32} color="#8B5CF6" />,
    title: 'Label Scanner',
    description:
      'Scan packaged food nutrition labels for an instant health analysis, red flags, and a personalised verdict.',
    href: '/tools/label-scanner',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.20)',
  },
];

export default function ToolsPage() {
  return (
    <div style={{ padding: '24px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ve-text)', marginBottom: 4 }}>Health Tools</h1>
      <p style={{ fontSize: 14, color: 'var(--ve-text-3)', marginBottom: 28 }}>
        Powerful health tools — completely free, forever
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {tools.map((tool) => (
          <div
            key={tool.title}
            style={{
              background: 'var(--ve-surface)',
              border: '1px solid var(--ve-border)',
              borderRadius: 20,
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 4px 24px rgba(124,58,237,0.10)',
              transition: 'box-shadow 0.2s, border-color 0.2s',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: tool.bg,
                border: `1px solid ${tool.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tool.icon}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ve-text)', marginBottom: 8 }}>{tool.title}</h2>
              <p style={{ fontSize: 13, color: 'var(--ve-text-3)', lineHeight: 1.6 }}>{tool.description}</p>
            </div>
            <Link href={tool.href} style={{ textDecoration: 'none', marginTop: 'auto' }}>
              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  fontSize: 14,
                }}
              >
                Open Tool
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
