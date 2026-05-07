'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Search, X, Loader2, ScanLine, AlertCircle, AlertTriangle, CheckCircle, XCircle, Bookmark, BookmarkCheck } from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';

type Mode = 'scan' | 'search';

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

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 7 ? '#22C55E' : score >= 4 ? '#F5C518' : '#EF4444';
  const label = score >= 7 ? 'Healthy' : score >= 4 ? 'Moderate' : 'Unhealthy';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `conic-gradient(${color} ${score * 36}deg, #2E2E2E ${score * 36}deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 8, color: '#A0A0A0' }}>/10</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    </div>
  );
}

function analyzeProduct(
  product: Record<string, unknown>,
  userGoals: string[]
): AnalysisReport {
  const n = (product.nutriments ?? {}) as ProductNutriments;
  const name = (product.product_name as string) || 'Unknown Product';
  const servingSize = (product.serving_size as string) || '100g';
  const ingredients = typeof product.ingredients_text === 'string'
    ? product.ingredients_text.slice(0, 200)
    : '';

  const calories = Math.round(n['energy-kcal_100g'] ?? 0);
  const protein = Math.round((n['proteins_100g'] ?? 0) * 10) / 10;
  const carbs = Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10;
  const sugar = Math.round((n['sugars_100g'] ?? 0) * 10) / 10;
  const fat = Math.round((n['fat_100g'] ?? 0) * 10) / 10;
  const saturatedFat = Math.round((n['saturated-fat_100g'] ?? 0) * 10) / 10;
  const sodiumG = n['sodium_100g'] ?? 0;
  const sodium = Math.round(sodiumG * 1000);
  const fibre = Math.round((n['fiber_100g'] ?? n['fibers_100g'] ?? 0) * 10) / 10;

  // Health score calculation
  let score = 10;
  if (sugar > 10) score -= 2;
  else if (sugar > 5) score -= 1;
  if (saturatedFat > 5) score -= 1.5;
  else if (saturatedFat > 2) score -= 0.5;
  if (sodium > 600) score -= 1.5;
  else if (sodium > 300) score -= 0.5;
  if (calories > 400) score -= 0.5;
  const additivesTags = (product.additives_tags as string[]) ?? [];
  if (additivesTags.length > 3) score -= 1;
  if (protein > 10) score += 0.5;
  if (fibre > 5) score += 0.5;
  score = Math.max(1, Math.min(10, Math.round(score)));

  // Red flags
  const redFlags: string[] = [];
  if (sodium > 600) redFlags.push(`High sodium (${sodium} mg/100g) — recommended < 600 mg`);
  if (saturatedFat > 5) redFlags.push(`High saturated fat (${saturatedFat}g/100g)`);
  if (sugar > 10) redFlags.push(`High sugar content (${sugar}g/100g)`);
  if (calories > 450) redFlags.push(`High calorie density (${calories} kcal/100g)`);
  if (additivesTags.length > 3) redFlags.push(`Contains ${additivesTags.length} food additives`);
  if (fibre < 1 && carbs > 20) redFlags.push('Low fibre content — refined carbohydrate source');

  // Positives
  const positives: string[] = [];
  if (protein > 10) positives.push(`Good protein source (${protein}g/100g)`);
  if (fibre > 5) positives.push(`High in dietary fibre (${fibre}g/100g)`);
  if (sodium < 200) positives.push('Low in sodium');
  if (saturatedFat < 1.5) positives.push('Low in saturated fat');
  if (sugar < 5) positives.push('Low in sugar');
  if (positives.length === 0) positives.push('No significant nutritional benefits identified');

  // Verdict
  let verdict = '';
  if (score >= 7) {
    verdict = `${name} is a nutritious choice. With moderate calories and good nutritional balance, it fits well into a healthy diet.`;
  } else if (score >= 4) {
    verdict = `${name} is a moderate option. It can be included occasionally as part of a balanced diet, but be mindful of portion sizes.`;
  } else {
    verdict = `${name} has several nutritional concerns. It is high in ${redFlags.map((f) => f.split(' ')[0].toLowerCase()).join(', ')} making it unsuitable for regular consumption.`;
  }

  // Goal-based verdict
  let goalVerdict = '';
  if (userGoals.includes('Weight Loss')) {
    if (calories > 350) goalVerdict += 'High calorie density — not ideal for weight loss. ';
    if (sugar > 10) goalVerdict += 'High sugar may spike insulin and hamper fat loss. ';
    if (fibre > 4) goalVerdict += 'Good fibre content supports satiety. ';
  }
  if (userGoals.includes('Build Strength')) {
    if (protein > 15) goalVerdict += 'Excellent protein content — great for muscle building. ';
    else if (protein < 5) goalVerdict += 'Low protein — supplement with a high-protein food. ';
  }
  if (!goalVerdict) goalVerdict = 'No specific conflicts with your health goals.';

  return {
    productName: name,
    servingSize,
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
    ingredients,
    verdict,
    goalVerdict: goalVerdict.trim(),
  };
}

export default function LabelScannerPage() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>('scan');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string; code: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [searchError, setSearchError] = useState('');

  const scannerRef = useRef<unknown>(null);
  const profile = useUserStore((s) => s.profile);
  const saveProduct = useUserStore((s) => s.saveProduct);
  const savedProducts = useUserStore((s) => s.savedProducts);

  useEffect(() => { setMounted(true); }, []);

  const fetchAndAnalyze = useCallback(async (barcode: string) => {
    setLoading(true);
    setScanError('');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        setReport(analyzeProduct(data.product, profile.goals));
      } else {
        setScanError('Product not found. Try searching by name.');
      }
    } catch {
      setScanError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [profile.goals]);

  const startScanner = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setScanError('');
    setReport(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader-label');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 140 } },
        async (decodedText: string) => {
          await scanner.stop();
          scannerRef.current = null;
          setScanning(false);
          fetchAndAnalyze(decodedText);
        },
        undefined
      );
      setScanning(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
        setScanError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else {
        setScanError(`Could not start camera: ${msg}`);
      }
    }
  }, [fetchAndAnalyze]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (scannerRef.current as any).stop();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => { return () => { stopScanner(); }; }, [stopScanner]);

  // Search products by name
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
    } catch {
      setSearchError('Network error.');
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  if (!mounted) return (
    <div style={{ padding: '24px 20px' }}>
      <div style={{ height: 40, background: '#1A1A1A', borderRadius: 12, marginBottom: 24, width: '50%' }} />
    </div>
  );

  const isSaved = report ? savedProducts.includes(report.productName) : false;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 620, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Label Scanner</h1>
      <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 24 }}>
        Scan a barcode for instant health analysis
      </p>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: 0, background: '#1A1A1A', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid #2E2E2E' }}>
        {(['scan', 'search'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              if (m !== 'scan') stopScanner();
              setReport(null);
              setScanError('');
              setSearchError('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 9,
              border: 'none',
              background: mode === m ? '#3B82F6' : 'transparent',
              color: mode === m ? '#FFFFFF' : '#A0A0A0',
              fontSize: 13,
              fontWeight: mode === m ? 700 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {m === 'scan' ? <><ScanLine size={14} /> Scan Barcode</> : <><Search size={14} /> Search by Name</>}
          </button>
        ))}
      </div>

      {/* SCAN MODE */}
      {mode === 'scan' && (
        <div>
          <div
            style={{
              background: '#111',
              border: '1px solid #2E2E2E',
              borderRadius: 24,
              overflow: 'hidden',
              marginBottom: 20,
              minHeight: 260,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div id="qr-reader-label" style={{ width: '100%', display: scanning ? 'block' : 'none' }} />

            {loading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <Loader2 size={32} color="#3B82F6" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#FFFFFF', fontSize: 14 }}>Analysing product...</p>
              </div>
            )}

            {!scanning && !loading && !report && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <ScanLine size={28} color="#3B82F6" />
                </div>
                <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 20 }}>
                  Point at the barcode on a packaged food
                </p>
                <button
                  onClick={startScanner}
                  style={{
                    background: '#3B82F6',
                    border: 'none',
                    borderRadius: 24,
                    padding: '12px 32px',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Camera size={16} /> Open Camera
                </button>
              </div>
            )}

            {scanning && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '20px 16px 14px', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={stopScanner}
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '8px 24px', color: '#FFFFFF', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <X size={14} /> Stop
                </button>
              </div>
            )}
          </div>

          {scanError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: '#EF4444', lineHeight: 1.5 }}>{scanError}</p>
            </div>
          )}
        </div>
      )}

      {/* SEARCH MODE */}
      {mode === 'search' && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={16} color="#A0A0A0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            {searching && (
              <Loader2 size={16} color="#3B82F6" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />
            )}
            <input
              className="input-field"
              placeholder="Search packaged foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 40, paddingRight: 40 }}
              autoFocus
            />
          </div>

          {searchError && <p style={{ fontSize: 12, color: '#F97316', marginBottom: 8 }}>{searchError}</p>}

          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchResults.map((item, i) => (
                <div
                  key={i}
                  onClick={() => { if (item.code) fetchAndAnalyze(item.code); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: '#1A1A1A',
                    border: '1px solid #2E2E2E',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </div>
                  <ScanLine size={14} color="#3B82F6" style={{ flexShrink: 0, marginLeft: 8 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYSIS REPORT */}
      {report && (
        <div className="animate-fade-in-up">
          {/* Header + Score */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 20, padding: '20px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              <ScoreGauge score={report.healthScore} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Health Analysis Report</p>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.productName}</h3>
                <p style={{ fontSize: 12, color: '#A0A0A0' }}>Serving: {report.servingSize}</p>
              </div>
            </div>

            {/* Nutrition table */}
            <div style={{ background: '#242424', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '8px 14px', borderBottom: '1px solid #2E2E2E' }}>
                <span style={{ fontSize: 10, color: '#A0A0A0', fontWeight: 700, textTransform: 'uppercase' }}>Nutrient</span>
                <span style={{ fontSize: 10, color: '#A0A0A0', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Per 100g</span>
              </div>
              {[
                { name: 'Energy', value: `${report.calories} kcal` },
                { name: 'Protein', value: `${report.protein}g` },
                { name: 'Carbohydrates', value: `${report.carbs}g` },
                { name: 'of which Sugar', value: `${report.sugar}g` },
                { name: 'Total Fat', value: `${report.fat}g` },
                { name: 'Saturated Fat', value: `${report.saturatedFat}g` },
                { name: 'Dietary Fibre', value: `${report.fibre}g` },
                { name: 'Sodium', value: `${report.sodium}mg` },
              ].map((row, i, arr) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '9px 14px', borderBottom: i < arr.length - 1 ? '1px solid #2E2E2E' : 'none' }}>
                  <span style={{ fontSize: 12, color: row.name.startsWith('of') ? '#888' : '#E0E0E0', paddingLeft: row.name.startsWith('of') ? 12 : 0 }}>{row.name}</span>
                  <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags */}
          {report.redFlags.length > 0 && (
            <div style={{ background: '#1A1A1A', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={15} color="#EF4444" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>Red Flags</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.redFlags.map((flag, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <XCircle size={13} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 12, color: '#E0E0E0', lineHeight: 1.5 }}>{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positives */}
          <div style={{ background: '#1A1A1A', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CheckCircle size={15} color="#22C55E" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#22C55E' }}>Positives</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {report.positives.map((pos, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <CheckCircle size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: '#E0E0E0', lineHeight: 1.5 }}>{pos}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          {report.ingredients && (
            <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Ingredients</p>
              <p style={{ fontSize: 12, color: '#A0A0A0', lineHeight: 1.6 }}>{report.ingredients}{report.ingredients.length >= 200 ? '...' : ''}</p>
            </div>
          )}

          {/* Verdict */}
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

          {/* Save + Scan Again */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => saveProduct(report.productName)}
              style={{
                flex: 1,
                padding: '12px',
                background: isSaved ? 'rgba(34,197,94,0.15)' : '#242424',
                border: `1px solid ${isSaved ? 'rgba(34,197,94,0.4)' : '#2E2E2E'}`,
                borderRadius: 12,
                color: isSaved ? '#22C55E' : '#A0A0A0',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {isSaved ? <><BookmarkCheck size={16} /> Saved</> : <><Bookmark size={16} /> Save Product</>}
            </button>
            <button
              onClick={() => { setReport(null); setScanError(''); }}
              style={{
                flex: 1,
                padding: '12px',
                background: '#3B82F6',
                border: 'none',
                borderRadius: 12,
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <ScanLine size={16} /> Scan Another
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>
    </div>
  );
}
