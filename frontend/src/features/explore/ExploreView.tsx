import { useNavigate } from 'react-router-dom';
import { HeartPulse, Trophy, HeartHandshake, ChevronRight, Compass } from 'lucide-react';
import ExploreFitness from './ExploreFitness';

export default function ExploreView() {
  const navigate = useNavigate();

  return (
    <div
      className="relative mx-auto min-h-screen w-full max-w-md bg-[#fcf8ff] pb-28 px-4 pt-5 text-slate-900"
      data-testid="explore-view-hub"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <Compass size={16} />
          <span>Explore Hub</span>
        </div>
        <h1 className="mt-1 font-heading text-2xl font-black text-slate-900">Explore</h1>
        <p className="mt-0.5 text-xs text-slate-500 font-medium leading-relaxed">
          Access specialized health engines, campus leaderboards, and fitness programs.
        </p>
      </div>

      {/* Section 1: Core Health Engines & Community (Grid of Cards) */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Core Health Engines &amp; Community
          </h2>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            3 Hubs
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Card 1: Clinical Vitals */}
          <div
            onClick={() => navigate('/health')}
            role="button"
            tabIndex={0}
            data-testid="explore-card-health"
            className="group relative flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-fern shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <HeartPulse size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-primary transition-colors">
                    Clinical Vitals
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800">
                    AHA 2017
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-800">
                    ADA Glycemic
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 font-medium leading-tight">
                  AHA BP &amp; Glycemic logs, trend analysis
                </p>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shrink-0 ml-2">
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Card 2: Campus Leaderboards */}
          <div
            onClick={() => navigate('/teams')}
            role="button"
            tabIndex={0}
            data-testid="explore-card-teams"
            className="group relative flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-saffron shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Trophy size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-primary transition-colors">
                    Campus Leaderboards
                  </h3>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-800">
                    3 Tiers
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 font-medium leading-tight">
                  3-tier Individual, Club &amp; University rankings
                </p>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shrink-0 ml-2">
              <ChevronRight size={16} />
            </div>
          </div>

          {/* Card 3: Care Circle */}
          <div
            onClick={() => navigate('/care-circle')}
            role="button"
            tabIndex={0}
            data-testid="explore-card-care-circle"
            className="group relative flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <HeartHandshake size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-primary transition-colors">
                    Care Circle
                  </h3>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 font-medium leading-tight">
                  Remote family health link &amp; crisis alerts
                </p>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shrink-0 ml-2">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Fitness & Workout Library */}
      <section className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Fitness &amp; Workout Library
            </h2>
            <p className="text-[11px] text-slate-500">
              Guided exercises, campus challenges, and active recovery routines
            </p>
          </div>
        </div>

        {/* Render existing fitness exercises, campus run circuits, and recovery guides */}
        <ExploreFitness embedded />
      </section>
    </div>
  );
}
