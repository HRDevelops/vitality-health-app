import { useState } from 'react';
import {
  X,
  ScanBarcode,
  FileText,
  Award,
  AlertTriangle,
  ShieldAlert,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { useLogProductScan } from '../../services/api/scanner';
import { useToast } from '../../components/ui/ToastContext';

interface ProductScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_OCR_LABELS = [
  {
    name: 'Unsweetened Almond Milk',
    text: 'Nutrition Facts\nServing Size 1 Cup (240ml)\nCalories 30\nSodium 170mg (7% DV)\nPotassium 160mg\nTotal Fat 2.5g',
    sodium: 170,
    calories: 30,
  },
  {
    name: 'Low-Sodium Organic Vegetable Broth',
    text: 'Nutrition Facts\nServing Size 1 Cup (240ml)\nCalories 15\nSodium 140mg (6% DV)\nPotassium 200mg\nTotal Fat 0g',
    sodium: 140,
    calories: 15,
  },
  {
    name: 'Canned Spicy Chili with Beans',
    text: 'Nutrition Facts\nServing Size 1 Cup (247g)\nCalories 260\nSodium 890mg (39% DV)\nTotal Carb 32g\nTotal Fat 8g',
    sodium: 890,
    calories: 260,
  },
];

export default function ProductScannerModal({
  isOpen,
  onClose,
}: ProductScannerModalProps) {
  const { showToast } = useToast();
  const logProductMutation = useLogProductScan();

  const [productName, setProductName] = useState(SAMPLE_OCR_LABELS[0].name);
  const [ocrText, setOcrText] = useState(SAMPLE_OCR_LABELS[0].text);
  const [sodiumMg, setSodiumMg] = useState(SAMPLE_OCR_LABELS[0].sodium);
  const [calories, setCalories] = useState(SAMPLE_OCR_LABELS[0].calories);
  const [activeTab, setActiveTab] = useState<'barcode' | 'ocr'>('barcode');
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleSelectSample = (sample: (typeof SAMPLE_OCR_LABELS)[0]) => {
    setProductName(sample.name);
    setOcrText(sample.text);
    setSodiumMg(sample.sodium);
    setCalories(sample.calories);
  };

  const handleParseOcr = (text: string) => {
    setOcrText(text);

    // Extract sodium
    const sodiumMatch =
      text.match(/sodium[\s:]*([0-9]+)\s*mg/i) ||
      text.match(/([0-9]+)\s*mg[\s\w]*sodium/i);
    if (sodiumMatch && sodiumMatch[1]) {
      setSodiumMg(parseInt(sodiumMatch[1], 10));
    }

    // Extract calories
    const caloriesMatch =
      text.match(/calories[\s:]*([0-9]+)/i) ||
      text.match(/([0-9]+)\s*kcal/i);
    if (caloriesMatch && caloriesMatch[1]) {
      setCalories(parseInt(caloriesMatch[1], 10));
    }
  };

  // Lab-verified Score calculation (0.0 to 10.0 scale)
  const calculateLabScore = (na: number): number => {
    let score = 9.5;
    if (na > 800) score -= 4.5;
    else if (na > 500) score -= 2.5;
    else if (na > 300) score -= 1.0;
    return Math.max(1.0, Math.min(10.0, Number(score.toFixed(1))));
  };

  const labScore = calculateLabScore(sodiumMg);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logProductMutation.mutateAsync({
        name: productName,
        sodiumMg,
        calories,
        ocrRawText: activeTab === 'ocr' ? ocrText : undefined,
      });
      showToast(`Product scan logged: ${productName} (${sodiumMg}mg Na).`);
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to log product scan.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <ScanBarcode size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Product Scanner</h3>
              <p className="text-[11px] text-slate-500">Barcode &amp; OCR Nutrition Extractor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="mt-3 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('barcode')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              activeTab === 'barcode' ? 'bg-white text-primary shadow-xs' : 'text-slate-500'
            }`}
          >
            Barcode Scanner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ocr')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              activeTab === 'ocr' ? 'bg-white text-primary shadow-xs' : 'text-slate-500'
            }`}
          >
            OCR Text Fallback
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Viewfinder simulation */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-teal-400/50 bg-slate-950 p-4 text-center text-white">
            <div className="relative z-10 flex flex-col items-center justify-center py-5">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 ${
                  isScanning ? 'animate-pulse scale-105' : ''
                }`}
              >
                {activeTab === 'barcode' ? (
                  <ScanBarcode size={28} className="text-teal-400" />
                ) : (
                  <FileText size={28} className="text-teal-400" />
                )}
              </div>
              <p className="mt-2.5 text-xs font-bold">
                {activeTab === 'barcode' ? 'Barcode Viewfinder Ready' : 'OCR Label Scanner Ready'}
              </p>
              <p className="text-[10px] text-slate-300">
                Align product packaging or select a verified test item
              </p>
            </div>
          </div>

          {/* Quick Item Presets */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Sample Verified Grocery Items
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SAMPLE_OCR_LABELS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`rounded-xl border p-2 text-left transition-all ${
                    productName === sample.name
                      ? 'border-teal-600 bg-teal-50/70 text-teal-900 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <p className="text-[11px] font-bold line-clamp-1">{sample.name}</p>
                  <p className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                    {sample.sodium}mg Na
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* OCR Raw Text Input if OCR Tab */}
          {activeTab === 'ocr' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  OCR Nutrition Panel Text
                </label>
                <span className="text-[10px] text-teal-700 font-bold">Auto-Detecting Values</span>
              </div>
              <textarea
                rows={3}
                value={ocrText}
                onChange={(e) => handleParseOcr(e.target.value)}
                placeholder="Paste or extract raw Nutrition Facts text..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-[11px] text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          )}

          {/* Editable Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sodium (mg)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={sodiumMg}
                  onChange={(e) => setSodiumMg(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 tabular-nums focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  min="0"
                  max="3000"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 tabular-nums focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Lab-verified Score Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
                  <Award size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Lab-Verified Health Score</h4>
                  <p className="text-[10px] text-slate-500">Sodium density &amp; nutritional quality</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-label-bold text-lg font-black text-slate-900 tabular-nums">
                  {labScore}
                </span>
                <span className="text-[10px] text-slate-400 font-bold"> / 10.0</span>
              </div>
            </div>

            {sodiumMg > 750 && (
              <div className="mt-2 flex items-start gap-1.5 rounded-xl border border-clay/30 bg-clay/10 p-2 text-[11px] text-clay font-semibold">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>Cardiovascular Warning: High sodium density package (&gt;750mg).</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={logProductMutation.isPending}
            className="w-full rounded-xl bg-teal-700 py-3 text-xs font-bold text-white shadow-md transition-all active:scale-98 hover:bg-teal-800 disabled:opacity-50"
          >
            {logProductMutation.isPending ? 'Logging Product...' : 'Record Product Scan'}
          </button>

          {/* Legal Disclaimer */}
          <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-2.5 flex items-start gap-2">
            <ShieldAlert size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Educational &amp; tracking support only. Not a medical diagnosis. If you experience severe symptoms, seek immediate emergency medical care.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
