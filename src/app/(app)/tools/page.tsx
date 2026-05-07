import Link from 'next/link';
import { Calculator, Camera, ScanLine } from 'lucide-react';

const tools = [
  {
    icon: <Calculator size={32} color="#22C55E" />,
    title: 'BMI Calculator',
    description:
      'Calculate your Body Mass Index instantly. Get your ideal weight range, health category, and personalised recommendations.',
    href: '/tools/bmi',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.1)',
  },
  {
    icon: <Camera size={32} color="#F5C518" />,
    title: 'Food Scanner',
    description:
      'Point your camera at any dish and get instant nutritional breakdown. Powered by AI food recognition technology.',
    href: '/tools/food-scanner',
    color: '#F5C518',
    bg: 'rgba(245,197,24,0.1)',
  },
  {
    icon: <ScanLine size={32} color="#3B82F6" />,
    title: 'Label Scanner',
    description:
      'Scan packaged food nutrition labels for an instant health analysis, red flags, and a personalised verdict.',
    href: '/tools/label-scanner',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
  },
];

export default function ToolsPage() {
  return (
    <div style={{ padding: '24px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Health Tools</h1>
      <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 28 }}>
        Powerful health tools — completely free, forever
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {tools.map((tool) => (
          <div
            key={tool.title}
            style={{
              background: '#1A1A1A',
              border: '1px solid #2E2E2E',
              borderRadius: 20,
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: tool.bg,
                border: `1px solid ${tool.color}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tool.icon}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>{tool.title}</h2>
              <p style={{ fontSize: 13, color: '#A0A0A0', lineHeight: 1.6 }}>{tool.description}</p>
            </div>
            <Link href={tool.href} style={{ textDecoration: 'none', marginTop: 'auto' }}>
              <button
                className="btn-primary"
                style={{
                  width: '100%',
                  fontSize: 14,
                  background: tool.color,
                  color: tool.color === '#F5C518' ? '#000000' : '#000000',
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
