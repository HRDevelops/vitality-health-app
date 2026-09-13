import { Utensils, ScanBarcode, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useDailyNutritionSummary } from '../../services/api/scanner';

interface DashSodiumCardProps {
  onOpenHeartPlate: () => void;
  onOpenProductScanner: () => void;
}

export default function DashSodiumCard({
  onOpenHeartPlate,
  onOpenProductScanner,
}: DashSodiumCardProps) {
  const { data: summary, isLoading } = useDailyNutritionSummary();

  const todaySodium = summary?.todaySodiumMg ?? 0;
  const optimalLimit = 1500;
  const upperLimit = 2300;

  const percentOfLimit = Math.min(100, Math.round((todaySodium / upperLimit) * 100));

  const tokenColor =
    todaySodium <= optimalLimit
      ? 'text-fern bg-emerald-50 border-emerald-200'
      : todaySodium <= upperLimit
      ? 'text-saffron bg-amber-50 border-amber-200'
      : 'text-clay bg-clay/10 border-clay/30';

  const barColor =
    todaySodium <= optimalLimit
      ? 'bg-fern'
      : todaySodium <= upperLimit
      ? 'bg-saffron'
      : 'bg-clay';

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-white to-indigo-50/30 p-5 shadow-sm shadow-indigo-500/5 transition-all"
      data-testid="dash-sodium-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-2xs">
            <Utensils size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">DASH Sodium Monitor</h3>
            <p className="text-[11px] text-slate-500">Cardiovascular intake vs. guidelines</p>
          </div>
        </div>

        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tokenColor}`}>
          {todaySodium <= optimalLimit
            ? 'Optimal (<1.5g)'
            : todaySodium <= upperLimit
            ? 'Moderate (<2.3g)'
            : 'Limit Exceeded'}
        </span>
      </div>

      {/* Main Sodium Number */}
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <span className="font-label-bold text-2xl font-black text-slate-900 tabular-nums">
            {isLoading ? '...' : todaySodium}
          </span>
          <span className="text-xs font-semibold text-slate-500 ml-1">mg sodium today</span>
        </div>
        <div className="text-right text-[11px] text-slate-400 tabular-nums">
          <span>Target: &lt;1,500 mg</span>
        </div>
      </div>

      {/* Progress Bar with 1,500mg and 2,300mg Marker Lines */}
      <div className="mt-2.5">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentOfLimit}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[9px] font-bold text-slate-400">
          <span>0 mg</span>
          <span className="text-fern">1,500 mg (DASH Optimal)</span>
          <span className="text-clay">2,300 mg (AHA Max)</span>
        </div>
      </div>

      {/* Warning Callout if Exceeded */}
      {todaySodium > upperLimit && (
        <div className="mt-3 flex items-start gap-1.5 rounded-xl border border-clay/30 bg-clay/10 p-2.5 text-xs text-clay font-medium">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>High Sodium Alert: You have surpassed the 2,300mg daily cardiovascular limit.</span>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenHeartPlate}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all"
        >
          <Utensils size={13} />
          <span>Scan Meal Plate</span>
        </button>

        <button
          type="button"
          onClick={onOpenProductScanner}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all"
        >
          <ScanBarcode size={13} />
          <span>Scan Product / OCR</span>
        </button>
      </div>
    </div>
  );
}
