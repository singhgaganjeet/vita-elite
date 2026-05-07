'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera, Plus, X, Loader2, AlertCircle, RefreshCw,
  Utensils, Flame, ChevronDown, ChevronUp, CheckCircle,
} from 'lucide-react';
import { useNutritionStore, type MealType } from '@/stores/useNutritionStore';

type Step = 'idle' | 'camera' | 'captured' | 'analysing' | 'result' | 'error';
const MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

interface FoodItem {
  name: string;
  portion: string;
  portionGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AnalysisResult {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  healthNotes: string;
  mealType: string;
}

function MacroPill({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div style={{ background: '#242424', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 17, fontWeight: 800, color, lineHeight: 1.1 }}>
        {value}<span style={{ fontSize: 10, color: '#A0A0A0', fontWeight: 400 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 10, color: '#A0A0A0', marginTop: 3 }}>{label}</div>
    </div>
  );
}

export default function FoodScannerPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [capturedImage, setCapturedImage] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Lunch');
  const [added, setAdded] = useState(false);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [analyseProgress, setAnalyseProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addFoodEntry = useNutritionStore((s) => s.addFoodEntry);

  useEffect(() => { setMounted(true); }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => {
    stopCamera();
    if (progressRef.current) clearInterval(progressRef.current);
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setError('');
    setResult(null);
    setCapturedImage('');
    setStep('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')
          ? 'Camera access denied. Please allow camera permissions in your browser settings.'
          : `Could not start camera: ${msg}`
      );
      setStep('error');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    setStep('captured');
  }, [stopCamera]);

  const analysePhoto = useCallback(async () => {
    if (!capturedImage) return;
    setStep('analysing');
    setAnalyseProgress(0);

    // Fake progress bar for UX (API typically takes 3–6s)
    progressRef.current = setInterval(() => {
      setAnalyseProgress(p => (p >= 85 ? p : p + Math.random() * 8));
    }, 400);

    try {
      // Strip data URL prefix
      const base64 = capturedImage.split(',')[1];
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType: 'image/jpeg' }),
      });
      const data = await res.json();

      if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
      setAnalyseProgress(100);

      if (data.error) {
        setError(data.error);
        setStep('error');
        return;
      }

      // Detect meal type from result suggestion
      const suggested = data.mealType as string;
      if (MEALS.includes(suggested as MealType)) setSelectedMeal(suggested as MealType);

      setResult(data as AnalysisResult);
      setStep('result');
    } catch {
      if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
      setError('Could not reach the analysis service. Check your connection and try again.');
      setStep('error');
    }
  }, [capturedImage]);

  const reset = useCallback(() => {
    stopCamera();
    setStep('idle');
    setCapturedImage('');
    setResult(null);
    setError('');
    setAdded(false);
    setExpandedItem(null);
    setAnalyseProgress(0);
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
  }, [stopCamera]);

  const handleAddAll = () => {
    if (!result) return;
    addFoodEntry(selectedMeal, {
      name: result.foods.map(f => f.name).join(', '),
      calories: result.totalCalories,
      protein: result.totalProtein,
      carbs: result.totalCarbs,
      fats: result.totalFat,
      fibre: 0,
      quantity: 1,
      unit: 'plate',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleAddSingle = (item: FoodItem) => {
    addFoodEntry(selectedMeal, {
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fat,
      fibre: 0,
      quantity: 1,
      unit: item.portion,
    });
  };

  if (!mounted) return <div style={{ padding: '24px 20px' }}><div style={{ height: 40, background: '#1A1A1A', borderRadius: 12, width: '50%' }} /></div>;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 620, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Food Analyser</h1>
        <p style={{ fontSize: 14, color: '#A0A0A0' }}>
          Take a photo of your meal — AI will identify every item and estimate the calories
        </p>
      </div>

      {/* ── CAMERA / CAPTURE AREA ── */}
      {(step === 'idle' || step === 'camera' || step === 'captured' || step === 'analysing') && (
        <div style={{
          background: '#0D0D0D', border: '1px solid #2E2E2E', borderRadius: 24,
          overflow: 'hidden', marginBottom: 20,
          minHeight: step === 'idle' ? 260 : 340,
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Live camera video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%', objectFit: 'cover',
              minHeight: 340, maxHeight: 480,
              display: step === 'camera' ? 'block' : 'none',
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Captured image */}
          {step === 'captured' && capturedImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={capturedImage}
              alt="Food photo"
              style={{ width: '100%', maxHeight: 440, objectFit: 'contain', display: 'block' }}
            />
          )}

          {/* Analysing overlay */}
          {step === 'analysing' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.88)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32,
            }}>
              {capturedImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={capturedImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, filter: 'blur(4px)' }} />
              )}
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <Loader2 size={40} color="#22C55E" style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                <p style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Analysing your meal…</p>
                <p style={{ color: '#A0A0A0', fontSize: 13, marginBottom: 20 }}>AI is identifying food items and estimating nutrition</p>
                <div style={{ width: 240, background: '#2E2E2E', borderRadius: 99, height: 6, margin: '0 auto' }}>
                  <div style={{ height: 6, borderRadius: 99, background: 'linear-gradient(90deg,#22C55E,#16A34A)', width: `${analyseProgress}%`, transition: 'width 0.4s ease' }} />
                </div>
                <p style={{ color: '#606060', fontSize: 11, marginTop: 8 }}>{Math.round(analyseProgress)}%</p>
              </div>
            </div>
          )}

          {/* Idle prompt */}
          {step === 'idle' && (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              }}>
                <Utensils size={34} color="#22C55E" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                Photograph your meal
              </p>
              <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 28, lineHeight: 1.6 }}>
                Point at your plate or bowl.<br />AI will identify every food item and tell you the calories.
              </p>
              <button
                onClick={startCamera}
                style={{
                  background: '#22C55E', border: 'none', borderRadius: 24,
                  padding: '13px 36px', color: '#000', fontSize: 14, fontWeight: 800,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                  letterSpacing: '0.2px',
                }}
              >
                <Camera size={17} /> Open Camera
              </button>
            </div>
          )}

          {/* Camera guide overlay */}
          {step === 'camera' && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {/* Corner guides */}
              {[
                { top: 20, left: 20, borderTop: '3px solid rgba(34,197,94,0.8)', borderLeft: '3px solid rgba(34,197,94,0.8)' },
                { top: 20, right: 20, borderTop: '3px solid rgba(34,197,94,0.8)', borderRight: '3px solid rgba(34,197,94,0.8)' },
                { bottom: 80, left: 20, borderBottom: '3px solid rgba(34,197,94,0.8)', borderLeft: '3px solid rgba(34,197,94,0.8)' },
                { bottom: 80, right: 20, borderBottom: '3px solid rgba(34,197,94,0.8)', borderRight: '3px solid rgba(34,197,94,0.8)' },
              ].map((style, i) => (
                <div key={i} style={{ position: 'absolute', width: 28, height: 28, borderRadius: 3, ...style }} />
              ))}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center', padding: '10px 16px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Frame your entire plate • Ensure good lighting</p>
              </div>
            </div>
          )}

          {/* Shutter button */}
          {step === 'camera' && (
            <div style={{
              position: 'absolute', bottom: 20, left: 0, right: 0,
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32,
            }}>
              <button
                onClick={reset}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} color="#FFFFFF" />
              </button>
              {/* Shutter */}
              <button
                onClick={capturePhoto}
                style={{
                  width: 70, height: 70, borderRadius: '50%',
                  background: '#FFFFFF', border: '5px solid rgba(255,255,255,0.4)',
                  cursor: 'pointer', boxShadow: '0 0 0 3px rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Camera size={24} color="#111" />
              </button>
              <div style={{ width: 44 }} />
            </div>
          )}
        </div>
      )}

      {/* Captured — retake or analyse */}
      {step === 'captured' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            onClick={startCamera}
            style={{
              flex: 1, padding: 13, background: '#1A1A1A',
              border: '1px solid #2E2E2E', borderRadius: 14,
              color: '#A0A0A0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <RefreshCw size={15} /> Retake
          </button>
          <button
            onClick={analysePhoto}
            style={{
              flex: 2, padding: 13, background: '#22C55E',
              border: 'none', borderRadius: 14,
              color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Utensils size={15} /> Analyse Meal
          </button>
        </div>
      )}

      {/* ── ERROR ── */}
      {step === 'error' && (
        <div>
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 16, padding: '20px', marginBottom: 16,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#EF4444', marginBottom: 6 }}>Analysis failed</p>
              <p style={{ fontSize: 13, color: '#E0E0E0', lineHeight: 1.6 }}>{error}</p>
            </div>
          </div>
          <button
            onClick={reset}
            style={{
              width: '100%', padding: 13, background: '#22C55E',
              border: 'none', borderRadius: 14,
              color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <RefreshCw size={15} /> Try Again
          </button>
        </div>
      )}

      {/* ── RESULT ── */}
      {step === 'result' && result && (
        <div className="animate-fade-in-up">
          {/* Captured photo thumbnail */}
          {capturedImage && (
            <div style={{ marginBottom: 16, borderRadius: 16, overflow: 'hidden', border: '1px solid #2E2E2E', maxHeight: 200 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt="Analysed meal" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Total calories hero */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.06))',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 20, padding: '22px 20px', marginBottom: 14, textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Total Estimated Calories</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
              <Flame size={28} color="#22C55E" />
              <span style={{ fontSize: 52, fontWeight: 900, color: '#22C55E', lineHeight: 1 }}>{result.totalCalories}</span>
              <span style={{ fontSize: 16, color: '#A0A0A0', alignSelf: 'flex-end', paddingBottom: 6 }}>kcal</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <MacroPill label="Protein" value={result.totalProtein} unit="g" color="#22C55E" />
              <MacroPill label="Carbs" value={result.totalCarbs} unit="g" color="#F5C518" />
              <MacroPill label="Fat" value={result.totalFat} unit="g" color="#F97316" />
            </div>
          </div>

          {/* Per-item breakdown */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
              Items Identified ({result.foods.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.foods.map((food, i) => {
                const open = expandedItem === i;
                return (
                  <div
                    key={i}
                    style={{
                      background: '#1A1A1A', border: '1px solid #2E2E2E',
                      borderRadius: 14, overflow: 'hidden',
                    }}
                  >
                    <div
                      onClick={() => setExpandedItem(open ? null : i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '13px 14px', cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                      }}>
                        🍽️
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</p>
                        <p style={{ fontSize: 11, color: '#A0A0A0' }}>{food.portion}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: '#22C55E' }}>{food.calories}</p>
                        <p style={{ fontSize: 10, color: '#A0A0A0' }}>kcal</p>
                      </div>
                      {open ? <ChevronUp size={14} color="#606060" style={{ flexShrink: 0 }} /> : <ChevronDown size={14} color="#606060" style={{ flexShrink: 0 }} />}
                    </div>

                    {open && (
                      <div style={{ padding: '0 14px 14px', borderTop: '1px solid #2E2E2E' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 12, marginBottom: 12 }}>
                          {[
                            { label: 'Protein', value: food.protein, color: '#22C55E' },
                            { label: 'Carbs', value: food.carbs, color: '#F5C518' },
                            { label: 'Fat', value: food.fat, color: '#F97316' },
                          ].map(m => (
                            <div key={m.label} style={{ background: '#242424', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}g</div>
                              <div style={{ fontSize: 9, color: '#A0A0A0' }}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleAddSingle(food)}
                          style={{
                            width: '100%', padding: '9px', background: 'rgba(34,197,94,0.1)',
                            border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10,
                            color: '#22C55E', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}
                        >
                          <Plus size={13} /> Add this item to {selectedMeal}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Health notes */}
          {result.healthNotes && (
            <div style={{
              background: '#1A1A1A', border: '1px solid #2E2E2E',
              borderRadius: 14, padding: '14px 16px', marginBottom: 16,
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <CheckCircle size={16} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>
                  Nutritionist Notes
                </p>
                <p style={{ fontSize: 13, color: '#C0C0C0', lineHeight: 1.65 }}>{result.healthNotes}</p>
              </div>
            </div>
          )}

          {/* Add all to meal */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 16, padding: '14px 16px', marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: '#A0A0A0', marginBottom: 10 }}>Add entire meal to:</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                value={selectedMeal}
                onChange={e => setSelectedMeal(e.target.value as MealType)}
                className="input-field"
                style={{ flex: 1, cursor: 'pointer' }}
              >
                {MEALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <button
                onClick={handleAddAll}
                style={{
                  flexShrink: 0, padding: '0 22px', height: 44,
                  background: added ? 'rgba(34,197,94,0.15)' : '#22C55E',
                  border: added ? '1px solid rgba(34,197,94,0.4)' : 'none',
                  borderRadius: 12, color: added ? '#22C55E' : '#000',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {added ? <><CheckCircle size={15} /> Added!</> : <><Plus size={15} /> Add All</>}
              </button>
            </div>
          </div>

          {/* Scan another */}
          <button
            onClick={reset}
            style={{
              width: '100%', padding: 13, background: 'transparent',
              border: '1px solid #2E2E2E', borderRadius: 14,
              color: '#A0A0A0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <RefreshCw size={15} /> Analyse Another Meal
          </button>
        </div>
      )}

      {/* Tips — only on idle */}
      {step === 'idle' && (
        <div style={{
          background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)',
          borderRadius: 14, padding: '14px 16px',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#22C55E', marginBottom: 10 }}>Tips for accurate results</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'Photograph from directly above the plate for best view',
              'Good lighting makes food items easier to identify',
              'Keep all food items visible — avoid stacking',
              'Works on any meal — Indian, Chinese, Western, snacks',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: '#22C55E', fontSize: 12, flexShrink: 0, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 12, color: '#A0A0A0', lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
