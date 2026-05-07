'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Search, Plus, X, Loader2, ScanLine, AlertCircle } from 'lucide-react';
import { useNutritionStore, type MealType } from '@/stores/useNutritionStore';

type Mode = 'scan' | 'search';
type CamStep = 'idle' | 'camera' | 'processing' | 'error';

const MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

interface NutritionResult {
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  fibre: number
  sodium: number
  servingSize: string
}

function parseOFFProduct(product: Record<string, unknown>): NutritionResult | null {
  const nutriments = (product.nutriments ?? {}) as Record<string, number>;
  const name = (product.product_name as string) || (product.product_name_en as string) || '';
  if (!name) return null;
  return {
    name,
    calories: Math.round(nutriments['energy-kcal_100g'] ?? 0),
    protein: Math.round((nutriments['proteins_100g'] ?? 0) * 10) / 10,
    carbs: Math.round((nutriments['carbohydrates_100g'] ?? 0) * 10) / 10,
    fats: Math.round((nutriments['fat_100g'] ?? 0) * 10) / 10,
    fibre: Math.round((nutriments['fiber_100g'] ?? nutriments['fibers_100g'] ?? 0) * 10) / 10,
    sodium: Math.round((nutriments['sodium_100g'] ?? 0) * 1000),
    servingSize: (product.serving_size as string) || '100g',
  };
}

export default function FoodScannerPage() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>('scan');
  const [camStep, setCamStep] = useState<CamStep>('idle');
  const [scanError, setScanError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NutritionResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(100);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Lunch');
  const [added, setAdded] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManual, setShowManual] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const addFoodEntry = useNutritionStore((s) => s.addFoodEntry);

  useEffect(() => { setMounted(true); }, []);

  const stopCamera = useCallback(() => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const fetchProductByBarcode = useCallback(async (barcode: string) => {
    stopCamera();
    setCamStep('processing');
    setLoading(true);
    setScanError('');
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const parsed = parseOFFProduct(data.product);
        if (parsed) {
          setResult(parsed);
          setQty(100);
          setCamStep('idle');
        } else {
          setScanError('Product found but nutrition data is incomplete. Try searching by name.');
          setCamStep('error');
        }
      } else {
        setScanError('Product not in Open Food Facts database. Try searching by name.');
        setCamStep('error');
      }
    } catch {
      setScanError('Network error. Check your connection.');
      setCamStep('error');
    } finally {
      setLoading(false);
    }
  }, [stopCamera]);

  const startBarcodeLoop = useCallback((video: HTMLVideoElement) => {
    // Try native BarcodeDetector API (Chrome/Android)
    type BD = { detect(src: HTMLVideoElement): Promise<{ rawValue: string }[]> };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const BD = (window as any).BarcodeDetector as (new (opts: object) => BD) | undefined;
    if (!BD) return false;

    let detector: BD;
    try {
      detector = new BD({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] });
    } catch {
      return false;
    }

    let found = false;
    const loop = async () => {
      if (found || !streamRef.current) return;
      try {
        if (video.readyState >= 2) {
          const codes = await detector.detect(video);
          if (codes.length > 0 && !found) {
            found = true;
            fetchProductByBarcode(codes[0].rawValue);
            return;
          }
        }
      } catch { /* ignore per-frame errors */ }
      scanLoopRef.current = requestAnimationFrame(loop);
    };
    scanLoopRef.current = requestAnimationFrame(loop);
    return true;
  }, [fetchProductByBarcode]);

  const startCamera = useCallback(async () => {
    setScanError('');
    setResult(null);
    setShowManual(false);
    setCamStep('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        const nativeWorked = startBarcodeLoop(videoRef.current);
        if (!nativeWorked) {
          // Fallback: show manual entry hint after 2s
          setTimeout(() => setShowManual(true), 2000);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setScanError(
        msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')
          ? 'Camera access denied. Please allow camera permissions in your browser settings.'
          : `Could not start camera: ${msg}`
      );
      setCamStep('error');
    }
  }, [startBarcodeLoop]);

  const stopAndReset = useCallback(() => {
    stopCamera();
    setCamStep('idle');
    setScanError('');
    setShowManual(false);
  }, [stopCamera]);

  // Search
  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearching(true);
    setSearchError('');
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=code,product_name,nutriments,serving_size`;
      const res = await fetch(url);
      const data = await res.json();
      const results: NutritionResult[] = (data.products ?? [])
        .map((p: Record<string, unknown>) => parseOFFProduct(p))
        .filter(Boolean) as NutritionResult[];
      setSearchResults(results);
      if (results.length === 0) setSearchError('No results found. Try a different search term.');
    } catch { setSearchError('Network error — could not reach Open Food Facts.'); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQuery), 500);
    return () => clearTimeout(t);
  }, [searchQuery, doSearch]);

  const handleAddToMeal = () => {
    if (!result) return;
    const scale = qty / 100;
    addFoodEntry(selectedMeal, {
      name: result.name,
      calories: Math.round(result.calories * scale),
      protein: Math.round(result.protein * scale * 10) / 10,
      carbs: Math.round(result.carbs * scale * 10) / 10,
      fats: Math.round(result.fats * scale * 10) / 10,
      fibre: Math.round(result.fibre * scale * 10) / 10,
      quantity: 1,
      unit: `${qty}g`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const scaledCalories = result ? Math.round(result.calories * qty / 100) : 0;

  if (!mounted) return <div style={{ padding: '24px 20px' }}><div style={{ height: 40, background: '#1A1A1A', borderRadius: 12, width: '50%' }} /></div>;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Food Scanner</h1>
      <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 24 }}>
        Scan a barcode or search by name to get nutrition info
      </p>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', background: '#1A1A1A', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid #2E2E2E' }}>
        {(['scan', 'search'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              if (m !== 'scan') stopAndReset();
              setResult(null);
              setScanError('');
              setSearchError('');
            }}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 9, border: 'none',
              background: mode === m ? '#22C55E' : 'transparent',
              color: mode === m ? '#000' : '#A0A0A0',
              fontSize: 13, fontWeight: mode === m ? 700 : 400, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {m === 'scan' ? <><ScanLine size={14} /> Scan Barcode</> : <><Search size={14} /> Search by Name</>}
          </button>
        ))}
      </div>

      {/* ── SCAN MODE ── */}
      {mode === 'scan' && !result && (
        <div>
          <div style={{
            background: '#111', border: '1px solid #2E2E2E', borderRadius: 24,
            overflow: 'hidden', marginBottom: 20, minHeight: 280,
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Live camera preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%', objectFit: 'cover', minHeight: 280,
                display: camStep === 'camera' ? 'block' : 'none',
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Processing state */}
            {(camStep === 'processing' || loading) && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <Loader2 size={32} color="#22C55E" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#FFFFFF', fontSize: 14 }}>Looking up product…</p>
              </div>
            )}

            {/* Idle state */}
            {camStep === 'idle' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <Camera size={30} color="#22C55E" />
                </div>
                <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 20 }}>
                  Point your camera at a product barcode
                </p>
                <button
                  onClick={startCamera}
                  style={{
                    background: '#22C55E', border: 'none', borderRadius: 24,
                    padding: '12px 32px', color: '#000', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Camera size={16} /> Open Camera
                </button>
              </div>
            )}

            {/* Camera scanning frame guide */}
            {camStep === 'camera' && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '80%', height: 120, border: '2px solid rgba(34,197,94,0.7)', borderRadius: 10, boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }} />
              </div>
            )}

            {/* Camera stop button */}
            {camStep === 'camera' && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '20px 16px 14px', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={stopAndReset}
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '8px 24px', color: '#FFFFFF', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <X size={14} /> Stop Scanning
                </button>
              </div>
            )}
          </div>

          {/* Manual barcode entry fallback */}
          {(showManual || camStep === 'error') && !loading && (
            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 10 }}>
                {camStep === 'error' ? 'Enter barcode manually:' : 'Auto-scan not supported on this browser. Enter barcode number:'}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="e.g. 8901030890999"
                  value={manualBarcode}
                  onChange={e => setManualBarcode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && manualBarcode.trim() && fetchProductByBarcode(manualBarcode.trim())}
                  className="input-field"
                  style={{ flex: 1, fontSize: 14 }}
                />
                <button
                  onClick={() => manualBarcode.trim() && fetchProductByBarcode(manualBarcode.trim())}
                  style={{ background: '#22C55E', border: 'none', borderRadius: 10, padding: '0 16px', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                >
                  Look Up
                </button>
              </div>
            </div>
          )}

          {/* Scan error */}
          {scanError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: '#EF4444', lineHeight: 1.5 }}>{scanError}</p>
            </div>
          )}
        </div>
      )}

      {/* ── SEARCH MODE ── */}
      {mode === 'search' && !result && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={16} color="#A0A0A0" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            {searching && <Loader2 size={16} color="#22C55E" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />}
            <input
              className="input-field"
              placeholder="Search Open Food Facts... (e.g. banana, milk, bread)"
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
                  onClick={() => { setResult(item); setQty(100); setScanError(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 12,
                    background: '#1A1A1A',
                    border: '1px solid #2E2E2E',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#A0A0A0' }}>per 100g</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#22C55E' }}>{item.calories}</div>
                    <div style={{ fontSize: 10, color: '#A0A0A0' }}>kcal/100g</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── RESULT CARD ── */}
      {result && (
        <div
          style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 20, padding: 20, marginBottom: 20 }}
          className="animate-fade-in-up"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.name}</h3>
              <p style={{ fontSize: 12, color: '#A0A0A0' }}>per 100g</p>
            </div>
            <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0A0A0', padding: 4, flexShrink: 0 }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ textAlign: 'center', background: '#242424', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 42, fontWeight: 900, color: '#22C55E', lineHeight: 1 }}>{scaledCalories}</span>
            <span style={{ fontSize: 14, color: '#A0A0A0', marginLeft: 4 }}>kcal</span>
            <p style={{ fontSize: 11, color: '#A0A0A0', marginTop: 4 }}>for {qty}g</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
            {[
              { label: 'Protein', value: Math.round(result.protein * qty / 100 * 10) / 10, unit: 'g', color: '#22C55E' },
              { label: 'Carbs', value: Math.round(result.carbs * qty / 100 * 10) / 10, unit: 'g', color: '#F5C518' },
              { label: 'Fats', value: Math.round(result.fats * qty / 100 * 10) / 10, unit: 'g', color: '#F97316' },
            ].map((m) => (
              <div key={m.label} style={{ background: '#242424', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}<span style={{ fontSize: 11, color: '#A0A0A0' }}>{m.unit}</span></div>
                <div style={{ fontSize: 10, color: '#A0A0A0', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Fibre', value: Math.round(result.fibre * qty / 100 * 10) / 10, unit: 'g', color: '#8B5CF6' },
              { label: 'Sodium', value: Math.round(result.sodium * qty / 100), unit: 'mg', color: '#EC4899' },
            ].map((m) => (
              <div key={m.label} style={{ background: '#242424', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}<span style={{ fontSize: 11, color: '#A0A0A0' }}>{m.unit}</span></div>
                <div style={{ fontSize: 10, color: '#A0A0A0', marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Quantity adjuster */}
          <div style={{ background: '#242424', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 8 }}>Amount (grams)</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setQty(Math.max(10, qty - 10))} style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A1A1A', border: '1px solid #2E2E2E', cursor: 'pointer', color: '#FFFFFF', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} style={{ width: 70, textAlign: 'center', padding: '6px', background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 8, color: '#FFFFFF', fontSize: 16, fontWeight: 700 }} />
              <button onClick={() => setQty(qty + 10)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A1A1A', border: '1px solid #2E2E2E', cursor: 'pointer', color: '#FFFFFF', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              <span style={{ fontSize: 13, color: '#A0A0A0' }}>g</span>
              <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: '#22C55E' }}>{scaledCalories} kcal</span>
            </div>
          </div>

          {/* Meal selector + Add button */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value as MealType)} className="input-field" style={{ cursor: 'pointer', flex: 1 }}>
              {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <button onClick={handleAddToMeal} className="btn-primary" style={{ flexShrink: 0, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
              {added ? '✓ Added!' : <><Plus size={16} /> Add</>}
            </button>
          </div>
        </div>
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
