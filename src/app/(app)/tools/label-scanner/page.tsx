'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera, Search, X, Loader2, ScanLine, AlertCircle, AlertTriangle,
  CheckCircle, XCircle, Bookmark, BookmarkCheck, ImageIcon, RefreshCw,
} from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';

type Mode = 'scan' | 'search';
type ScanStep = 'idle' | 'camera' | 'captured' | 'processing' | 'done' | 'error';

interface NutritionData {
  calories: number | null
  fat: number | null
  saturatedFat: number | null
  transFat: number | null
  cholesterol: number | null
  sodium: number | null
  carbs: number | null
  fibre: number | null
  sugar: number | null
  protein: number | null
}

interface AnalysisReport {
  productName: string
  servingSize: string
  healthScore: number
  calories: number
  protein: number
  carbs: number
  sugar: number
  fat: number
  saturatedFat: number
  sodium: number
  fibre: number
  redFlags: string[]
  positives: string[]
  ingredients: string
  verdict: string
  goalVerdict: string
}

interface ProductNutriments {
  'energy-kcal_100g'?: number
  'proteins_100g'?: number
  'carbohydrates_100g'?: number
  'fat_100g'?: number
  'saturated-fat_100g'?: number
  'fiber_100g'?: number
  'fibers_100g'?: number
  'sugars_100g'?: number
  'sodium_100g'?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function num(v: number | null | undefined): number {
  return v ?? 0;
}

function parseNutritionLabel(text: string): NutritionData {
  const t = text.replace(/[_|]/g, ' ').replace(/\s+/g, ' ');

  function extract(patterns: RegExp[]): number | null {
    for (const re of patterns) {
      const m = t.match(re);
      if (m) {
        const v = parseFloat(m[1].replace(',', '.'));
        if (!isNaN(v)) return v;
      }
    }
    return null;
  }

  const calories = extract([
    /calories?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(?:kcal|cal|k)?/i,
    /energy\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(?:kcal|cal|kj)?/i,
    /(\d+(?:\.\d+)?)\s*(?:kcal|cal)\b/i,
  ]);

  const fat = extract([
    /total\s+fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /\bfat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const saturatedFat = extract([
    /saturated\s+fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /sat\.?\s*fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const transFat = extract([
    /trans\s+fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /trans\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const cholesterol = extract([
    /cholesterol\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i,
  ]);

  const sodium = extract([
    /sodium\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i,
    /salt\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const carbs = extract([
    /total\s+carbohydrate\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /carbohydrates?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /carbs?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const fibre = extract([
    /dietary\s+fi[b|br]er\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /fi[b|br]e[r|re]?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const sugar = extract([
    /total\s+sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  const protein = extract([
    /protein\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  return { calories, fat, saturatedFat, transFat, cholesterol, sodium, carbs, fibre, sugar, protein };
}

function buildReportFromOCR(data: NutritionData, goals: string[], rawText: string): AnalysisReport {
  const calories = Math.round(num(data.calories));
  const fat = Math.round(num(data.fat) * 10) / 10;
  const saturatedFat = Math.round(num(data.saturatedFat) * 10) / 10;
  const transFat = num(data.transFat);
  const sodium = Math.round(num(data.sodium));
  const carbs = Math.round(num(data.carbs) * 10) / 10;
  const fibre = Math.round(num(data.fibre) * 10) / 10;
  const sugar = Math.round(num(data.sugar) * 10) / 10;
  const protein = Math.round(num(data.protein) * 10) / 10;

  let score = 10;
  if (sugar > 15) score -= 2.5;
  else if (sugar > 10) score -= 2;
  else if (sugar > 5) score -= 1;
  if (saturatedFat > 5) score -= 2;
  else if (saturatedFat > 2) score -= 1;
  if (transFat > 0.5) score -= 2;
  if (sodium > 800) score -= 2;
  else if (sodium > 600) score -= 1.5;
  else if (sodium > 300) score -= 0.5;
  if (calories > 500) score -= 1;
  else if (calories > 350) score -= 0.5;
  if (protein > 15) score += 1;
  else if (protein > 8) score += 0.5;
  if (fibre > 5) score += 0.5;
  score = Math.max(1, Math.min(10, Math.round(score)));

  const redFlags: string[] = [];
  if (sodium > 600) redFlags.push(`High sodium — ${sodium} mg/serving (recommended < 600 mg)`);
  if (saturatedFat > 5) redFlags.push(`High saturated fat — ${saturatedFat}g/serving`);
  if (transFat > 0.5) redFlags.push(`Contains trans fat — ${transFat}g/serving (avoid)`);
  if (sugar > 10) redFlags.push(`High sugar content — ${sugar}g/serving`);
  if (calories > 450) redFlags.push(`High calorie density — ${calories} kcal/serving`);
  if (fibre < 1 && carbs > 20) redFlags.push('Low fibre — likely refined carbohydrate source');

  const positives: string[] = [];
  if (protein > 10) positives.push(`Good protein source — ${protein}g/serving`);
  if (fibre > 5) positives.push(`High in dietary fibre — ${fibre}g/serving`);
  if (sodium < 200) positives.push('Low in sodium');
  if (saturatedFat < 1.5) positives.push('Low in saturated fat');
  if (sugar < 5) positives.push('Low in sugar');
  if (transFat === 0) positives.push('Trans fat free');
  if (positives.length === 0) positives.push('No significant nutritional benefits identified');

  // Try to extract product name from OCR
  const firstLines = rawText.split('\n').slice(0, 3).join(' ').trim();
  const productName = firstLines.replace(/nutrition facts?/i, '').trim().slice(0, 40) || 'Scanned Product';

  const label = score >= 7 ? 'healthy choice' : score >= 4 ? 'moderate option' : 'nutritionally concerning product';
  const verdict = `This product is a ${label} based on its label. ${
    redFlags.length > 0
      ? `Key concerns: ${redFlags.slice(0, 2).map(f => f.split('—')[0].trim().toLowerCase()).join(', ')}.`
      : 'The nutritional profile is balanced.'
  }`;

  let goalVerdict = '';
  if (goals.includes('Weight Loss')) {
    if (calories > 300) goalVerdict += 'High calories — watch portion size for weight loss. ';
    if (sugar > 8) goalVerdict += 'Elevated sugar may impact fat loss. ';
    if (fibre > 4) goalVerdict += 'Good fibre helps with satiety. ';
  }
  if (goals.includes('Build Strength')) {
    if (protein > 15) goalVerdict += 'Excellent protein — supports muscle building. ';
    else if (protein < 5) goalVerdict += 'Low protein — pair with a high-protein food. ';
  }
  if (!goalVerdict) goalVerdict = 'No specific conflicts with your goals.';

  return {
    productName,
    servingSize: 'per serving',
    healthScore: score,
    calories,
    protein,
    carbs,
    sugar,
    fat,
    saturatedFat,
    sodium,
    fibre,
    redFlags,
    positives,
    ingredients: '',
    verdict,
    goalVerdict: goalVerdict.trim(),
  };
}

function analyzeSearchProduct(product: Record<string, unknown>, userGoals: string[]): AnalysisReport {
  const n = (product.nutriments ?? {}) as ProductNutriments;
  const name = (product.product_name as string) || 'Unknown Product';
  const calories = Math.round(n['energy-kcal_100g'] ?? 0);
  const protein = Math.round((n['proteins_100g'] ?? 0) * 10) / 10;
  const carbs = Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10;
  const sugar = Math.round((n['sugars_100g'] ?? 0) * 10) / 10;
  const fat = Math.round((n['fat_100g'] ?? 0) * 10) / 10;
  const saturatedFat = Math.round((n['saturated-fat_100g'] ?? 0) * 10) / 10;
  const sodium = Math.round((n['sodium_100g'] ?? 0) * 1000);
  const fibre = Math.round((n['fiber_100g'] ?? n['fibers_100g'] ?? 0) * 10) / 10;
  const ingredients = typeof product.ingredients_text === 'string'
    ? (product.ingredients_text as string).slice(0, 200) : '';
  const additivesTags = (product.additives_tags as string[]) ?? [];

  let score = 10;
  if (sugar > 10) score -= 2; else if (sugar > 5) score -= 1;
  if (saturatedFat > 5) score -= 1.5; else if (saturatedFat > 2) score -= 0.5;
  if (sodium > 600) score -= 1.5; else if (sodium > 300) score -= 0.5;
  if (calories > 400) score -= 0.5;
  if (additivesTags.length > 3) score -= 1;
  if (protein > 10) score += 0.5;
  if (fibre > 5) score += 0.5;
  score = Math.max(1, Math.min(10, Math.round(score)));

  const redFlags: string[] = [];
  if (sodium > 600) redFlags.push(`High sodium (${sodium} mg/100g)`);
  if (saturatedFat > 5) redFlags.push(`High saturated fat (${saturatedFat}g/100g)`);
  if (sugar > 10) redFlags.push(`High sugar (${sugar}g/100g)`);
  if (calories > 450) redFlags.push(`High calorie density (${calories} kcal/100g)`);
  if (additivesTags.length > 3) redFlags.push(`${additivesTags.length} food additives`);

  const positives: string[] = [];
  if (protein > 10) positives.push(`Good protein (${protein}g/100g)`);
  if (fibre > 5) positives.push(`High fibre (${fibre}g/100g)`);
  if (sodium < 200) positives.push('Low sodium');
  if (saturatedFat < 1.5) positives.push('Low saturated fat');
  if (sugar < 5) positives.push('Low sugar');
  if (positives.length === 0) positives.push('No significant nutritional benefits identified');

  const verdict = score >= 7
    ? `${name} is a nutritious choice with a well-balanced nutritional profile.`
    : score >= 4
      ? `${name} is a moderate option — suitable occasionally as part of a balanced diet.`
      : `${name} has nutritional concerns: ${redFlags.slice(0, 2).map(f => f.toLowerCase()).join(', ')}.`;

  let goalVerdict = '';
  if (userGoals.includes('Weight Loss')) {
    if (calories > 350) goalVerdict += 'High calorie density — watch portions. ';
    if (sugar > 10) goalVerdict += 'High sugar may slow fat loss. ';
    if (fibre > 4) goalVerdict += 'Good fibre supports satiety. ';
  }
  if (userGoals.includes('Build Strength')) {
    if (protein > 15) goalVerdict += 'Excellent protein for muscle building. ';
    else if (protein < 5) goalVerdict += 'Low protein — supplement with protein-rich foods. ';
  }
  if (!goalVerdict) goalVerdict = 'No specific conflicts with your health goals.';

  return {
    productName: name, servingSize: '100g', healthScore: score,
    calories, protein, carbs, sugar, fat, saturatedFat, sodium, fibre,
    redFlags, positives, ingredients,
    verdict, goalVerdict: goalVerdict.trim(),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 7 ? '#22C55E' : score >= 4 ? '#F5C518' : '#EF4444';
  const label = score >= 7 ? 'Healthy' : score >= 4 ? 'Moderate' : 'Unhealthy';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: `conic-gradient(${color} ${score * 36}deg, #2E2E2E ${score * 36}deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%', background: '#1A1A1A',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        }}>
          <span style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 8, color: '#A0A0A0' }}>/10</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    </div>
  );
}

function ReportCard({ report, onReset, profile, savedProducts, saveProduct }: {
  report: AnalysisReport;
  onReset: () => void;
  profile: { goals: string[] };
  savedProducts: string[];
  saveProduct: (name: string) => void;
}) {
  const isSaved = savedProducts.includes(report.productName);
  const rows = [
    { name: 'Energy', value: `${report.calories} kcal` },
    { name: 'Protein', value: `${report.protein}g` },
    { name: 'Carbohydrates', value: `${report.carbs}g` },
    { name: 'of which Sugar', value: `${report.sugar}g` },
    { name: 'Total Fat', value: `${report.fat}g` },
    { name: 'Saturated Fat', value: `${report.saturatedFat}g` },
    { name: 'Dietary Fibre', value: `${report.fibre}g` },
    { name: 'Sodium', value: `${report.sodium}mg` },
  ];

  return (
    <div className="animate-fade-in-up">
      <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 20, padding: 20, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <ScoreGauge score={report.healthScore} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Health Analysis</p>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.productName}</h3>
            <p style={{ fontSize: 12, color: '#A0A0A0' }}>Per {report.servingSize}</p>
          </div>
        </div>
        <div style={{ background: '#242424', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '8px 14px', borderBottom: '1px solid #2E2E2E' }}>
            <span style={{ fontSize: 10, color: '#A0A0A0', fontWeight: 700, textTransform: 'uppercase' }}>Nutrient</span>
            <span style={{ fontSize: 10, color: '#A0A0A0', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Amount</span>
          </div>
          {rows.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '9px 14px', borderBottom: i < rows.length - 1 ? '1px solid #2E2E2E' : 'none' }}>
              <span style={{ fontSize: 12, color: row.name.startsWith('of') ? '#888' : '#E0E0E0', paddingLeft: row.name.startsWith('of') ? 12 : 0 }}>{row.name}</span>
              <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {report.redFlags.length > 0 && (
        <div style={{ background: '#1A1A1A', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={15} color="#EF4444" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>Red Flags</span>
          </div>
          {report.redFlags.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <XCircle size={13} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: '#E0E0E0', lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#1A1A1A', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <CheckCircle size={15} color="#22C55E" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#22C55E' }}>Positives</span>
        </div>
        {report.positives.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
            <CheckCircle size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: '#E0E0E0', lineHeight: 1.5 }}>{p}</span>
          </div>
        ))}
      </div>

      {report.ingredients && (
        <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Ingredients</p>
          <p style={{ fontSize: 12, color: '#A0A0A0', lineHeight: 1.6 }}>{report.ingredients}{report.ingredients.length >= 200 ? '...' : ''}</p>
        </div>
      )}

      <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Verdict</p>
        <p style={{ fontSize: 13, color: '#E0E0E0', lineHeight: 1.7, marginBottom: 12 }}>{report.verdict}</p>
        {profile.goals.length > 0 && (
          <div style={{ background: 'rgba(34,197,94,0.08)', borderRadius: 10, padding: '10px 12px', borderLeft: '3px solid #22C55E' }}>
            <p style={{ fontSize: 12, color: '#A0A0A0', fontWeight: 600, marginBottom: 4 }}>For your goals ({profile.goals.join(', ')})</p>
            <p style={{ fontSize: 12, color: '#E0E0E0', lineHeight: 1.5 }}>{report.goalVerdict}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => saveProduct(report.productName)}
          style={{
            flex: 1, padding: 12,
            background: isSaved ? 'rgba(34,197,94,0.15)' : '#242424',
            border: `1px solid ${isSaved ? 'rgba(34,197,94,0.4)' : '#2E2E2E'}`,
            borderRadius: 12, color: isSaved ? '#22C55E' : '#A0A0A0',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {isSaved ? <><BookmarkCheck size={16} /> Saved</> : <><Bookmark size={16} /> Save</>}
        </button>
        <button
          onClick={onReset}
          style={{
            flex: 1, padding: 12, background: '#3B82F6', border: 'none', borderRadius: 12,
            color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <RefreshCw size={16} /> Scan Another
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LabelScannerPage() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>('scan');
  const [step, setStep] = useState<ScanStep>('idle');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [ocrError, setOcrError] = useState('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string; code: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const profile = useUserStore((s) => s.profile);
  const saveProduct = useUserStore((s) => s.saveProduct);
  const savedProducts = useUserStore((s) => s.savedProducts);

  useEffect(() => { setMounted(true); }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async () => {
    setOcrError('');
    setReport(null);
    setCapturedImage('');
    setStep('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOcrError(
        msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')
          ? 'Camera access denied. Please allow camera permissions in your browser settings and try again.'
          : `Could not start camera: ${msg}`
      );
      setStep('error');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
    setStep('captured');
  }, [stopCamera]);

  const runOCR = useCallback(async () => {
    if (!capturedImage) return;
    setStep('processing');
    setOcrProgress(0);
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100));
        },
      });
      const { data: { text } } = await worker.recognize(capturedImage);
      await worker.terminate();

      const parsed = parseNutritionLabel(text);
      const hasData = Object.values(parsed).some(v => v !== null && v !== 0);
      if (!hasData) {
        setOcrError('Could not read nutrition values. Make sure the label is well-lit, in focus, and fills the frame.');
        setStep('error');
        return;
      }
      const result = buildReportFromOCR(parsed, profile.goals, text);
      setReport(result);
      setStep('done');
    } catch {
      setOcrError('OCR processing failed. Please try again with a clearer photo.');
      setStep('error');
    }
  }, [capturedImage, profile.goals]);

  const reset = useCallback(() => {
    stopCamera();
    setStep('idle');
    setReport(null);
    setCapturedImage('');
    setOcrError('');
    setOcrProgress(0);
  }, [stopCamera]);

  // Search
  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearching(true);
    setSearchError('');
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=code,product_name`;
      const res = await fetch(url);
      const data = await res.json();
      const results = (data.products ?? [])
        .filter((p: Record<string, string>) => p.product_name)
        .map((p: Record<string, string>) => ({ name: p.product_name, code: p.code }));
      setSearchResults(results);
      if (results.length === 0) setSearchError('No results. Try a different term.');
    } catch { setSearchError('Network error.'); }
    finally { setSearching(false); }
  }, []);

  const fetchAndAnalyze = useCallback(async (code: string) => {
    setSearchLoading(true);
    setSearchError('');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        setReport(analyzeSearchProduct(data.product, profile.goals));
      } else {
        setSearchError('Product not found.');
      }
    } catch { setSearchError('Network error.'); }
    finally { setSearchLoading(false); }
  }, [profile.goals]);

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery, doSearch]);

  if (!mounted) return <div style={{ padding: '24px 20px' }}><div style={{ height: 40, background: '#1A1A1A', borderRadius: 12, width: '50%' }} /></div>;

  const showReport = report && (step === 'done' || mode === 'search');

  return (
    <div style={{ padding: '24px 20px', maxWidth: 620, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Label Scanner</h1>
      <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 24 }}>
        Photograph a nutrition facts label — we&apos;ll analyse it for you
      </p>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', background: '#1A1A1A', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid #2E2E2E' }}>
        {(['scan', 'search'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              if (m === 'scan') { setReport(null); setSearchError(''); }
              else { reset(); setSearchError(''); }
            }}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 9, border: 'none',
              background: mode === m ? '#3B82F6' : 'transparent',
              color: mode === m ? '#FFFFFF' : '#A0A0A0',
              fontSize: 13, fontWeight: mode === m ? 700 : 400, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {m === 'scan' ? <><Camera size={14} /> Scan Label</> : <><Search size={14} /> Search by Name</>}
          </button>
        ))}
      </div>

      {/* ── SCAN TAB ── */}
      {mode === 'scan' && !showReport && (
        <div>
          {/* Camera / Preview area */}
          <div style={{
            background: '#111', border: '1px solid #2E2E2E', borderRadius: 24,
            overflow: 'hidden', marginBottom: 20, minHeight: 280,
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Live video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: step === 'camera' ? 'block' : 'none',
                minHeight: 280,
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Captured image preview */}
            {step === 'captured' && capturedImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capturedImage} alt="Captured label" style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }} />
            )}

            {/* OCR Processing overlay */}
            {step === 'processing' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
                <Loader2 size={36} color="#3B82F6" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 600 }}>Reading nutrition label…</p>
                <div style={{ width: '100%', background: '#2E2E2E', borderRadius: 99, height: 6 }}>
                  <div style={{ height: 6, borderRadius: 99, background: '#3B82F6', width: `${ocrProgress}%`, transition: 'width 0.3s' }} />
                </div>
                <p style={{ color: '#A0A0A0', fontSize: 12 }}>{ocrProgress}% — analysing text</p>
              </div>
            )}

            {/* Idle state */}
            {step === 'idle' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <ImageIcon size={30} color="#3B82F6" />
                </div>
                <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 8 }}>
                  Point your camera at the <strong style={{ color: '#FFFFFF' }}>Nutrition Facts</strong> label
                </p>
                <p style={{ fontSize: 12, color: '#606060', marginBottom: 24 }}>Ensure good lighting and hold the phone steady</p>
                <button
                  onClick={startCamera}
                  style={{
                    background: '#3B82F6', border: 'none', borderRadius: 24,
                    padding: '12px 32px', color: '#FFFFFF', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Camera size={16} /> Open Camera
                </button>
              </div>
            )}

            {/* Camera overlay guide */}
            {step === 'camera' && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '85%', height: 200, border: '2px solid rgba(59,130,246,0.7)',
                  borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                }} />
              </div>
            )}

            {/* Camera controls */}
            {step === 'camera' && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                padding: '24px 16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <button
                  onClick={reset}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '8px 20px', color: '#FFFFFF', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  style={{
                    width: 64, height: 64, borderRadius: '50%', border: '4px solid #FFFFFF',
                    background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 0 4px rgba(255,255,255,0.25)',
                  }}
                >
                  <Camera size={22} color="#111" />
                </button>
                <div style={{ width: 80 }} />
              </div>
            )}
          </div>

          {/* Captured controls */}
          {step === 'captured' && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button
                onClick={startCamera}
                style={{
                  flex: 1, padding: '12px', background: '#242424',
                  border: '1px solid #2E2E2E', borderRadius: 12, color: '#A0A0A0',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <RefreshCw size={15} /> Retake
              </button>
              <button
                onClick={runOCR}
                style={{
                  flex: 2, padding: '12px', background: '#3B82F6',
                  border: 'none', borderRadius: 12, color: '#FFFFFF',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <ScanLine size={15} /> Analyse Label
              </button>
            </div>
          )}

          {/* Error */}
          {(step === 'error' || ocrError) && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, color: '#EF4444', lineHeight: 1.5 }}>{ocrError}</p>
                {step === 'error' && (
                  <button onClick={reset} style={{ marginTop: 8, fontSize: 12, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Try again →</button>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          {step === 'idle' && (
            <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 12, color: '#60A5FA', fontWeight: 700, marginBottom: 8 }}>Tips for best results</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['Ensure bright, even lighting — avoid shadows', 'Hold the phone parallel to the label', 'Fill the blue guide box with the Nutrition Facts table', 'Use Search tab if OCR struggles with your label'].map((tip, i) => (
                  <li key={i} style={{ fontSize: 12, color: '#A0A0A0', display: 'flex', gap: 8 }}>
                    <span style={{ color: '#3B82F6', flexShrink: 0 }}>•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── SEARCH TAB ── */}
      {mode === 'search' && !showReport && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={16} color="#A0A0A0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            {(searching || searchLoading) && <Loader2 size={16} color="#3B82F6" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />}
            <input
              className="input-field"
              placeholder="Search packaged foods by name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setReport(null); }}
              style={{ paddingLeft: 40, paddingRight: 40 }}
              autoFocus
            />
          </div>
          {searchError && <p style={{ fontSize: 12, color: '#F97316', marginBottom: 8 }}>{searchError}</p>}
          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchResults.map((item, i) => (
                <div key={i} onClick={() => fetchAndAnalyze(item.code)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: '#1A1A1A', border: '1px solid #2E2E2E', cursor: 'pointer' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <ScanLine size={14} color="#3B82F6" style={{ flexShrink: 0, marginLeft: 8 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REPORT ── */}
      {showReport && (
        <ReportCard
          report={report!}
          onReset={() => { setReport(null); if (mode === 'scan') reset(); }}
          profile={profile}
          savedProducts={savedProducts}
          saveProduct={saveProduct}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to   { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
