import { useMemo, useState } from 'react';
import { Play, Pause, Lock, Search } from 'lucide-react';
import TopBar from '../../core/components/TopBar';
import { usePodcasts } from '../../services/api/podcasts';
import { ListSkeleton } from '../../components/ui/Skeleton';
import { Podcast } from '../../types/domain';
import SubscriptionPaywallModal from './components/SubscriptionPaywallModal';

const categories = ['New', 'Now', 'Popular', 'Trending', 'Mindset', 'Sleep'];

const CATEGORY_MATCHERS: Record<string, (p: Podcast) => boolean> = {
  New: () => true,
  Now: () => true,
  Popular: () => true,
  Trending: () => true,
  Mindset: (p) => p.category.toLowerCase() === 'mindset',
  Sleep: (p) => p.category.toLowerCase() === 'sleep',
};

export default function MindfulnessPodcast() {
  const { data: podcasts, isLoading } = usePodcasts();
  const [activeCategory, setActiveCategory] = useState('New');
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const dailyPick = podcasts?.find((p) => p.isDailyPick);

  const trackList = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (podcasts ?? [])
      .filter((p) => !p.isDailyPick)
      .filter((p) => CATEGORY_MATCHERS[activeCategory](p))
      .filter((p) => query === '' || p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  }, [podcasts, activeCategory, search]);

  const handleTrackClick = (track: Podcast) => {
    if (track.isPremium) {
      setPaywallOpen(true);
      return;
    }
    setPlayingId((current) => (current === track.id ? null : track.id));
  };

  return (
    <div data-testid="mindfulness-podcast-screen">
      <TopBar
        title="Podcast"
        showBack
        rightSlot={
          <button className="rounded-full p-2 text-primary transition-colors hover:bg-surface-variant" data-testid="podcast-search-button">
            <Search size={20} />
          </button>
        }
      />

      <main className="px-container-margin pb-16">
        <section className="mb-section-gap mt-4">
          <div
            className="group relative flex h-64 cursor-pointer flex-col justify-end overflow-hidden rounded-xl bg-primary p-6 text-on-primary shadow-soft-lg transition-opacity hover:opacity-95"
            data-testid="podcast-daily-pick-card"
          >
            {dailyPick?.imageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${dailyPick.imageUrl}')` }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="mb-2 rounded-full bg-white/20 px-3 py-1 font-label-bold text-label-bold uppercase tracking-widest text-primary-fixed-dim backdrop-blur-sm">
                Daily Pick
              </span>
              <h2 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile">{dailyPick?.title ?? 'Sleep With Me Bedtime Stories'}</h2>
              <p className="mb-6 max-w-[250px] font-body-sm text-body-sm text-primary-fixed">Train your mind for a happier, healthier life</p>
              <button
                onClick={() => dailyPick && handleTrackClick(dailyPick)}
                className="flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 font-body-sm text-on-primary backdrop-blur-md transition-all hover:bg-white/30"
                data-testid="podcast-daily-pick-play-button"
              >
                {dailyPick && playingId === dailyPick.id ? <Pause size={18} /> : <Play size={18} />}
                Let&apos;s start
              </button>
            </div>
          </div>
        </section>

        <section className="mb-section-gap">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md">Wellness</h3>
            <button className="font-body-sm text-primary hover:underline" data-testid="podcast-see-all-button">
              See All
            </button>
          </div>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search episodes"
              className="w-full rounded-full border-none bg-surface-container-low py-3 pl-11 pr-4 font-body-sm text-body-sm text-on-surface shadow-sm outline-none transition-shadow placeholder:text-outline-variant focus:ring-2 focus:ring-primary"
              data-testid="podcast-search-input"
            />
          </div>

          <div className="no-scrollbar -mx-container-margin flex gap-3 overflow-x-auto px-container-margin pb-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                data-testid={`podcast-category-${c.toLowerCase()}`}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-5 py-2 font-body-sm transition-colors ${
                  activeCategory === c ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-dim'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {isLoading && <ListSkeleton rows={4} />}

          {!isLoading && trackList.length === 0 && (
            <p className="py-10 text-center font-body-sm text-body-sm text-outline" data-testid="podcast-empty-state">
              No episodes match your search.
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-gutter">
            {trackList.map((track) => (
              <button
                key={track.id}
                onClick={() => handleTrackClick(track)}
                data-testid={`podcast-track-${track.id}`}
                className="group flex h-full flex-col text-left"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded bg-surface-container shadow-sm transition-shadow group-hover:shadow-md">
                  <span className="absolute left-3 top-3 z-10 rounded-sm bg-white px-2 py-1 font-label-bold text-[10px] text-primary shadow-sm">
                    {track.category}
                  </span>
                  {track.isPremium && (
                    <span className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-inverse-surface text-inverse-on-surface shadow-sm">
                      <Lock size={12} />
                    </span>
                  )}
                  <img
                    src={track.imageUrl}
                    alt={track.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {playingId === track.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Pause size={28} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-grow flex-col justify-between">
                  <h4 className="mb-1 font-body-lg text-body-lg font-semibold leading-tight text-on-surface">{track.title}</h4>
                  <p className="font-body-sm text-body-sm text-outline">{track.durationMinutes} minutes</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {paywallOpen && <SubscriptionPaywallModal onClose={() => setPaywallOpen(false)} />}
    </div>
  );
}
