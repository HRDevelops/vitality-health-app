import { useMemo, useState } from 'react';
import { Bell, Search, MoreHorizontal, Droplet, Apple, Leaf, Flower2, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardMetrics } from '../../services/api/dashboard';
import NotificationsSheet from '../../components/ui/NotificationsSheet';
import WorkoutDetailModal, { WorkoutDetail } from './components/WorkoutDetailModal';

const trendingWorkouts: (WorkoutDetail & { meta: string; intensity: number; tags: string[]; image: string })[] = [
  {
    id: 'office-workout',
    title: 'Office Workout',
    meta: 'Beginner • 7 mins',
    intensity: 2,
    tags: ['office', 'cardio', 'beginner'],
    difficulty: 'Beginner',
    durationLabel: '7 mins',
    calorieTarget: 60,
    steps: ['Desk push-ups — 45 sec', 'Seated leg raises — 45 sec', 'Chair squats — 45 sec'],
    logPayload: { steps: 400, caloriesBurned: 60, distanceKm: 0.3, activeMinutes: 7 },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsCINaD_I-UvqGvpImEs6pgYCcrNg-95P7lV9JkHhRY4dY2DhpkrgWuBLZ5RVmRcWVrJTRRZA9VBx-Yjnrub9jbK2o1stg-9zNPAQPhlRKjByN0ifK5r8iCG7ewtiA9tt4-SUckGcvWoKHygjNyhh9e-TgFH_MtPAWZNUKLJ6eu7F7CSiBdZJ31eiH1tBioDYALaePnsH9ED-HskhkTew2ZmjdzL9aBNlSCgZwbAzau_UpWyHjPeR65g',
  },
  {
    id: 'abs-intermediate',
    title: 'Abs Intermediate',
    meta: 'Advance • 7 mins',
    intensity: 3,
    tags: ['abs', 'core', 'advance'],
    difficulty: 'Advance',
    durationLabel: '7 mins',
    calorieTarget: 70,
    steps: ['Plank hold — 60 sec', 'Bicycle crunches — 45 sec', 'Leg raises — 45 sec'],
    logPayload: { steps: 150, caloriesBurned: 70, distanceKm: 0, activeMinutes: 7 },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPgtHQfbYzkhqu6vGIlpDMm7EJj3JLqhktnH4wNmLYlOE4l6uJ498uptVNl-EMjJggqLD9IC7W-3n5tWRuk8Mzy8ceRNGyGi6sg1iZ0iy3c9ukZaw8pEBk__xxnTP3NRPyGynGJOirTyMmCu2LSn3pnH1IsEaT-NUqj4n2ZAuTAkACtO2WKYYKvaByUKklMri2QNqy1RdP7wche4DVaI93-qmzE90f4TNVHFPu21XRe38bnkqWlgabfg',
  },
  {
    id: 'cardio-blast',
    title: 'Cardio Blast',
    meta: 'Intermediate • 15 mins',
    intensity: 3,
    tags: ['cardio', 'intermediate'],
    difficulty: 'Intermediate',
    durationLabel: '15 mins',
    calorieTarget: 180,
    steps: ['Jumping jacks — 60 sec', 'High knees — 60 sec', 'Burpees — 45 sec'],
    logPayload: { steps: 1800, caloriesBurned: 180, distanceKm: 1.2, activeMinutes: 15 },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDVzOwA6stNH3p47KDmE4eU2l3_TlZYh_3hSkpyjuSNfCjTzWAb88gRPUqD5pC-Pv_KwABnLnhbNn75mMySMvw6LcnG_l2BxSdNR2HtgHHxk8cuOgu6lFBE5yhJEcr-kX9inR0c0jetpBhf48tMfjFUxz-98Wp3_1ZyEgFpc4gDxLJL4u_idtFp-ucBHqbPKPGo8U7gi4ECbCA_oCQ3WjKUQenmlkA4zEpI9DO8WSJm6WoGi9gC5LOjcQ',
  },
];

const cardioChallenge: WorkoutDetail = {
  id: 'cardio-challenge',
  title: 'Cardio Challenge',
  difficulty: 'Intermediate',
  durationLabel: '20 mins',
  calorieTarget: 250,
  steps: ['Warm-up jog — 5 min', 'Interval sprints — 10 min', 'Cool-down stretch — 5 min'],
  logPayload: { steps: 2500, caloriesBurned: 250, distanceKm: 2, activeMinutes: 20 },
};

const workoutCategories = ['All', 'Cardio', 'Office', 'Abs'];

const topics = [
  { id: 'nutrition', label: 'Nutrition', icon: Apple, bg: 'bg-error-container/50', fg: 'text-on-error-container', route: '/nutrition' },
  { id: 'organic', label: 'Organic', icon: Leaf, bg: 'bg-tertiary-fixed/50', fg: 'text-on-tertiary-fixed', route: null },
  { id: 'meditation', label: 'Meditation', icon: Flower2, bg: 'bg-secondary-fixed/50', fg: 'text-on-secondary-fixed', route: '/wellness/podcast' },
  { id: 'snacks', label: 'Healthy Snacks Idea', icon: Utensils, bg: 'bg-primary-fixed/50', fg: 'text-on-primary-fixed', route: '/nutrition' },
];

export default function ExploreFitness() {
  const navigate = useNavigate();
  const { data } = useDashboardMetrics();
  const [search, setSearch] = useState('');
  const [activeWorkoutCategory, setActiveWorkoutCategory] = useState('All');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetail | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const filteredWorkouts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return trendingWorkouts.filter((w) => {
      const matchesCategory = activeWorkoutCategory === 'All' || w.tags.includes(activeWorkoutCategory.toLowerCase());
      const matchesSearch = query === '' || w.title.toLowerCase().includes(query) || w.tags.some((t) => t.includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [search, activeWorkoutCategory]);

  return (
    <div data-testid="explore-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-background px-container-margin py-4">
        <div className="flex items-center gap-3">
          {data?.avatarUrl && <img src={data.avatarUrl} alt="Profile" className="h-10 w-10 rounded-full object-cover shadow-sm" />}
          <h1 className="font-headline-md text-headline-md text-on-surface">Hi, {data?.greetingName ?? 'Grace'}</h1>
        </div>
        <button
          onClick={() => setNotificationsOpen(true)}
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant"
          data-testid="explore-notifications-button"
        >
          <Bell size={22} />
        </button>
      </header>

      <main className="flex flex-col gap-section-gap px-container-margin py-section-gap">
        <div className="relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topic"
            className="w-full rounded-full border-none bg-surface-container-low py-4 pl-12 pr-4 font-body-sm text-body-sm text-on-surface shadow-sm outline-none transition-shadow placeholder:text-outline-variant focus:ring-2 focus:ring-primary"
            data-testid="explore-search-input"
          />
        </div>

        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <h2 className="font-headline-lg-mobile text-on-surface">Challenge</h2>
            <button className="font-label-bold text-label-bold text-primary hover:opacity-80" data-testid="explore-challenge-see-all">
              SEE ALL
            </button>
          </div>
          <div
            className="group relative flex min-h-[320px] w-full flex-col justify-between overflow-hidden rounded-[32px] bg-primary-container p-6 shadow-soft-lg transition-transform duration-300 hover:scale-[1.01]"
            data-testid="explore-challenge-card"
          >
            <div
              className="absolute inset-0 bg-cover bg-right opacity-80 mix-blend-luminosity transition-opacity duration-500 group-hover:opacity-90"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDVzOwA6stNH3p47KDmE4eU2l3_TlZYh_3hSkpyjuSNfCjTzWAb88gRPUqD5pC-Pv_KwABnLnhbNn75mMySMvw6LcnG_l2BxSdNR2HtgHHxk8cuOgu6lFBE5yhJEcr-kX9inR0c0jetpBhf48tMfjFUxz-98Wp3_1ZyEgFpc4gDxLJL4u_idtFp-ucBHqbPKPGo8U7gi4ECbCA_oCQ3WjKUQenmlkA4zEpI9DO8WSJm6WoGi9gC5LOjcQ')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/80 to-transparent" />
            <div className="relative z-10 flex max-w-[60%] flex-col gap-2">
              <span className="font-label-bold text-label-bold uppercase tracking-wider text-primary-fixed">Fitness</span>
              <h3 className="font-headline-lg text-4xl font-extrabold leading-tight text-on-primary">Cardio</h3>
              <p className="mt-2 font-body-sm text-on-primary/90">Get active on your off days and challenge your friends</p>
            </div>
            <div className="relative z-10 mt-auto flex items-center justify-between pt-8">
              <div className="flex -space-x-3">
                <div className="h-8 w-8 rounded-full border-2 border-primary-container bg-surface-container-high" />
                <div className="h-8 w-8 rounded-full border-2 border-primary-container bg-surface-container-high" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-container bg-surface-container-high font-label-bold text-[10px] text-primary">
                  +12
                </div>
              </div>
              <button
                onClick={() => setSelectedWorkout(cardioChallenge)}
                className="rounded-full bg-surface-container-lowest px-6 py-2 font-label-bold text-label-bold text-primary shadow-md transition-transform duration-200 hover:scale-105"
                data-testid="explore-challenge-start-button"
              >
                Start
              </button>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <h2 className="font-headline-md text-on-surface">Trending</h2>
            <button className="text-outline-variant transition-colors hover:text-primary" data-testid="explore-trending-more">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="no-scrollbar -mx-container-margin flex gap-2 overflow-x-auto px-container-margin pb-1">
            {workoutCategories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveWorkoutCategory(c)}
                data-testid={`explore-category-${c.toLowerCase()}`}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-body-sm transition-colors ${
                  activeWorkoutCategory === c ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-dim'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {filteredWorkouts.length === 0 && (
              <p className="py-6 text-center font-body-sm text-body-sm text-outline" data-testid="explore-trending-empty">
                No workouts match your search.
              </p>
            )}
            {filteredWorkouts.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWorkout(w)}
                data-testid={`explore-trending-${w.id}`}
                className="flex items-center rounded-2xl bg-surface-container-lowest p-card-padding text-left shadow-[0px_8px_24px_rgba(115,103,240,0.06)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-1 flex-col gap-1">
                  <div className="mb-2 flex gap-1 text-primary-container">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Droplet key={i} size={14} className={i < w.intensity ? 'fill-current' : ''} />
                    ))}
                  </div>
                  <h4 className="font-headline-md text-lg text-on-surface">{w.title}</h4>
                  <p className="font-body-sm text-sm text-on-surface-variant">{w.meta}</p>
                </div>
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm">
                  <img src={w.image} alt={w.title} className="h-full w-full object-cover" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-headline-md text-on-surface">Topics For You</h2>
            <button className="text-outline-variant transition-colors hover:text-primary" data-testid="explore-topics-more">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="flex justify-between gap-2">
            {topics.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => t.route && navigate(t.route)}
                  data-testid={`explore-topic-${t.id}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition-colors ${t.bg} ${t.fg}`}>
                    <Icon size={26} />
                  </div>
                  <span className="text-center font-label-bold text-[10px] text-on-surface-variant">{t.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {selectedWorkout && <WorkoutDetailModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />}
      {notificationsOpen && <NotificationsSheet onClose={() => setNotificationsOpen(false)} />}
    </div>
  );
}
