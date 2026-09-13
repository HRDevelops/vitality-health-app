import { useState } from 'react';
import {
  X,
  Camera,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Utensils,
  Sparkles,
  ShieldAlert,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useLogMealScan } from '../../services/api/scanner';
import { useToast } from '../../components/ui/ToastContext';

interface HeartPlateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MEALS = [
  {
    name: 'Grilled Salmon & Quinoa Bowl',
    sodium: 420,
    calories: 480,
    desc: 'Fresh omega-3 rich fish, steamed greens, olive oil.',
  },
  {
    name: 'Roasted Turkey & Avocado Wrap',
    sodium: 680,
    calories: 520,
    desc: 'Whole grain tortilla, sliced breast, mixed leaves.',
  },
  {
    name: 'Smoked Shoyu Ramen with Chashu',
    sodium: 1350,
    calories: 780,
    desc: 'Rich concentrated broth with seasoned bamboo shoots.',
  },
];

export default function HeartPlateScannerModal({
  isOpen,
  onClose,
}: HeartPlateScannerModalProps) {
  const { showToast } = useToast();
  const logMealMutation = useLogMealScan();

  const [dishName, setDishName] = useState(PRESET_MEALS[0].name);
  const [sodiumMg, setSodiumMg] = useState(PRESET_MEALS[0].sodium);
  const [calories, setCalories] = useState(PRESET_MEALS[0].calories);
  const [cookingMode, setCookingMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCaptured, setScanCaptured] = useState(true);

  if (!isOpen) return null;

  // If cooking mode is toggled, reduce effective sodium by 40%
  const effectiveSodium = cookingMode ? Math.round(sodiumMg * 0.6) : sodiumMg;

  const getCompliance = (mg: number) => {
    if (mg <= 500) {
      return {
        label: 'Optimal DASH (<500mg)',
        token: 'Fern',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        progressColor: 'bg-fern',
        alertMsg: null,
      };
    }
    if (mg <= 750) {
      return {
        label: 'Moderate Sodium (501–750mg)',
        token: 'Saffron',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        progressColor: 'bg-saffron',
        alertMsg: 'Approaching upper meal sodium threshold. Balance with low-sodium side.',
      };
    }
    return {
      label: 'Exceeds DASH Limit (>750mg)',
      token: 'Clay',
      badgeClass: 'bg-clay/10 text-clay border-clay/30',
      progressColor: 'bg-clay',
      alertMsg: 'High Sodium Warning: Exceeds recommended single-meal cardiovascular limits.',
    };
  };

  const compliance = getCompliance(effectiveSodium);

  const handleSimulateShutter = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanCaptured(true);
      showToast('Heart Plate scan captured and analyzed.');
    }, 700);
  };

  const handleSelectPreset = (preset: (typeof PRESET_MEALS)[0]) => {
    setDishName(preset.name);
    setSodiumMg(preset.sodium);
    setCalories(preset.calories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logMealMutation.mutateAsync({
        name: dishName,
        sodiumMg: effectiveSodium,
        calories,
        cookingMode,
        notes: cookingMode ? 'Prepared with Cooking Mode sodium reduction.' : undefined,
      });
      showToast(`Heart plate logged: ${effectiveSodium}mg sodium.`);
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to log meal scan.');
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Utensils size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Heart Plate Scanner</h3>
              <p className="text-[11px] text-slate-500">DASH Sodium Density &amp; Visual Meter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Simulated Camera Viewfinder */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-slate-900 p-4 text-center text-white">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center py-6">
              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-white/10 transition-all ${
                  isScanning ? 'scale-110 border-primary animate-pulse' : ''
                }`}
              >
                <Camera size={26} className="text-white" />
              </div>
              <p className="mt-3 text-xs font-bold tracking-wide">
                {isScanning ? 'Analyzing plate density...' : 'Camera Viewfinder Active'}
              </p>
              <p className="text-[10px] text-slate-300">
                Position meal in frame or choose a meal sample below
              </p>

              <button
                type="button"
                onClick={handleSimulateShutter}
                disabled={isScanning}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 transition-all active:scale-95"
              >
                <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                <span>Snap &amp; Classify</span>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select or Customize Meal
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESET_MEALS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`rounded-xl border p-2 text-left transition-all ${
                    dishName === preset.name
                      ? 'border-primary bg-primary/5 text-primary shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <p className="text-[11px] font-bold line-clamp-1">{preset.name}</p>
                  <p className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                    {preset.sodium}mg Na
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Meal Details Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name</label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
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

          {/* Cooking Mode Switcher */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <Flame size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Cooking Mode</h4>
                  <p className="text-[10px] text-slate-500">
                    Apply low-sodium salt substitution (-40% Na)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCookingMode(!cookingMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  cookingMode ? 'bg-fern' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    cookingMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sodium Meter & DASH Evaluation Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">DASH Sodium Rating</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${compliance.badgeClass}`}
              >
                {compliance.label}
              </span>
            </div>

            {/* Visual Bar */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-500 tabular-nums mb-1">
                <span>Effective: {effectiveSodium} mg</span>
                <span>Meal Target: &lt;=500 mg</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all duration-300 ${compliance.progressColor}`}
                  style={{ width: `${Math.min(100, Math.round((effectiveSodium / 1000) * 100))}%` }}
                />
              </div>
            </div>

            {compliance.alertMsg && (
              <div className="flex items-start gap-1.5 pt-1 text-[11px] text-clay font-medium">
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                <span>{compliance.alertMsg}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={logMealMutation.isPending}
            className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md transition-all active:scale-98 hover:bg-primary/95 disabled:opacity-50"
          >
            {logMealMutation.isPending ? 'Logging Scan...' : 'Log Heart Plate to Diary'}
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
