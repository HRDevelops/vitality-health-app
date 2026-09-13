import { useState } from 'react';
import {
  X,
  Trophy,
  Award,
  Crown,
  Sparkles,
  Lock,
  CheckCircle2,
  HeartPulse,
  Droplet,
  Footprints,
  Bike,
  Utensils,
  ScanBarcode,
  Scale,
  Users,
  HeartHandshake,
  Star,
  Flame,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Compass,
  MapPin,
  Leaf,
  Check,
  FileText,
  UserCheck,
  AlarmClock,
  GraduationCap,
  Eye,
  Headphones,
  Activity,
  Gauge,
  User,
  UtensilsCrossed,
  Barcode,
  AlertTriangle,
  Heart,
  Medal,
  Calendar,
  Flag,
  Map,
  ToggleRight,
  ArrowDownCircle,
  CheckCheck,
  Zap,
  PhoneCall,
  Droplets,
  Timer,
  TrendingUp,
  LucideIcon,
} from 'lucide-react';
import { useAchievements } from '../../services/api/achievements';
import { RarityTier, EvaluatedAchievement } from '../../types/domain';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Trophy,
  Award,
  Crown,
  Sparkles,
  Lock,
  CheckCircle2,
  HeartPulse,
  Droplet,
  Footprints,
  Bike,
  Utensils,
  ScanBarcode,
  Scale,
  Users,
  HeartHandshake,
  Star,
  Flame,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Compass,
  MapPin,
  Leaf,
  Check,
  FileText,
  UserCheck,
  AlarmClock,
  GraduationCap,
  Eye,
  Headphones,
  Activity,
  Gauge,
  User,
  UtensilsCrossed,
  Barcode,
  AlertTriangle,
  Heart,
  Medal,
  Calendar,
  Flag,
  Map,
  ToggleRight,
  ArrowDownCircle,
  CheckCheck,
  Zap,
  PhoneCall,
  Droplets,
  Timer,
  TrendingUp,
};

const RARITY_CONFIG: Record<
  RarityTier,
  { label: string; border: string; bg: string; badge: string; text: string }
> = {
  COMMON: {
    label: 'Common',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    text: 'text-slate-600',
  },
  UNCOMMON: {
    label: 'Uncommon',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50/50',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    text: 'text-emerald-700',
  },
  RARE: {
    label: 'Rare',
    border: 'border-blue-300',
    bg: 'bg-blue-50/50',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    text: 'text-blue-700',
  },
  EPIC: {
    label: 'Epic',
    border: 'border-purple-300',
    bg: 'bg-purple-50/50',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    text: 'text-purple-700',
  },
  LEGENDARY: {
    label: 'Legendary',
    border: 'border-amber-400 shadow-amber-100',
    bg: 'bg-amber-50/60',
    badge: 'bg-amber-100 text-amber-900 border-amber-400',
    text: 'text-amber-800',
  },
  MYTHIC: {
    label: 'Mythic',
    border: 'border-rose-400 shadow-rose-100',
    bg: 'bg-gradient-to-br from-rose-50 to-orange-50',
    badge: 'bg-rose-100 text-rose-900 border-rose-400',
    text: 'text-rose-800',
  },
};

export default function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { data: summary, isLoading } = useAchievements();
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) return null;

  const allAchievements: EvaluatedAchievement[] = summary?.achievements || [];

  const filteredAchievements = allAchievements.filter((a) => {
    if (selectedRarity !== 'ALL' && a.rarity !== selectedRarity) return false;
    if (activeTab === 'unlocked' && !a.isUnlocked) return false;
    if (activeTab === 'locked' && a.isUnlocked) return false;
    return true;
  });

  const totalUnlocked = summary?.totalUnlocked ?? 0;
  const totalAvailable = summary?.totalAvailable ?? 100;
  const percentUnlocked = Math.round((totalUnlocked / totalAvailable) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-xs">
              <Trophy size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">100 Achievements</h3>
              <p className="text-[11px] text-slate-500">6 Rarity Tiers &amp; Milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Global Progress Overview Banner */}
        <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">Total Collection</span>
            <span className="font-label-bold text-xs font-black text-primary tabular-nums">
              {totalUnlocked} / {totalAvailable} ({percentUnlocked}%)
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${percentUnlocked}%` }}
            />
          </div>

          {/* Rarity breakdown pills */}
          <div className="mt-3 flex items-center justify-between gap-1 overflow-x-auto pb-1 text-[10px] font-bold">
            {(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'] as RarityTier[]).map(
              (r) => {
                const count = summary?.byRarity[r]?.unlocked ?? 0;
                const total = summary?.byRarity[r]?.total ?? 0;
                const config = RARITY_CONFIG[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRarity(selectedRarity === r ? 'ALL' : r)}
                    className={`shrink-0 rounded-lg border px-2 py-1 transition-all ${
                      selectedRarity === r
                        ? `${config.badge} shadow-xs font-black ring-1 ring-primary/40`
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{config.label}: </span>
                    <span className="tabular-nums">
                      {count}/{total}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Unlocked / Locked Segmented Filter */}
        <div className="flex px-5 pt-3 pb-2 gap-2 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-primary text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            All ({allAchievements.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unlocked')}
            className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition-all ${
              activeTab === 'unlocked'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Unlocked ({totalUnlocked})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('locked')}
            className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition-all ${
              activeTab === 'locked'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            Locked ({totalAvailable - totalUnlocked})
          </button>
        </div>

        {/* Badges List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading achievements...</div>
          ) : filteredAchievements.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No achievements found.</div>
          ) : (
            filteredAchievements.map((item) => {
              const rarityConfig = RARITY_CONFIG[item.rarity];
              const IconComponent = ICON_MAP[item.iconName] || Award;
              const isUnlocked = item.isUnlocked;

              return (
                <div
                  key={item.id}
                  className={`relative flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                    isUnlocked
                      ? `${rarityConfig.border} ${rarityConfig.bg} shadow-2xs`
                      : 'border-slate-200 bg-slate-50/50 opacity-65'
                  }`}
                >
                  {/* Badge Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs ${
                      isUnlocked
                        ? `${rarityConfig.badge} border-current`
                        : 'border-slate-200 bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? <IconComponent size={20} /> : <Lock size={18} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4
                          className={`text-xs font-bold truncate ${
                            isUnlocked ? 'text-slate-900' : 'text-slate-500'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 tabular-nums">#{item.id}</span>
                      </div>

                      <span
                        className={`shrink-0 rounded-md border px-1.5 py-0.2 text-[9px] font-bold ${rarityConfig.badge}`}
                      >
                        {rarityConfig.label}
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                      {item.description}
                    </p>

                    {/* Unlocked date or status */}
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">
                        {item.category}
                      </span>

                      {isUnlocked && item.unlockedAt ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          <span>
                            Unlocked{' '}
                            {new Date(item.unlockedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Locked</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
