import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Pencil, Ruler, Cake, Weight, Award, TrendingUp, Settings, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import TopBar from '../../core/components/TopBar';
import { useUserProfile } from '../../services/api/user';
import { useLeaderboard } from '../../services/api/community';
import { useReminders } from '../../services/api/reminders';
import { ListSkeleton } from '../../components/ui/Skeleton';
import LeaderboardCard from './components/LeaderboardCard';
import RemindersCard from './components/RemindersCard';
import EditWeightModal from './components/EditWeightModal';

export default function UserProfile() {
  const location = useLocation();
  const [weightModalOpen, setWeightModalOpen] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.openWeightEdit) {
      setWeightModalOpen(true);
    }
  }, [location.state]);

  const { data: user, isLoading } = useUserProfile();
  const { data: leaderboard } = useLeaderboard();
  const { data: reminders } = useReminders();

  return (
    <div data-testid="user-profile-screen">
      <TopBar
        title={`Hi, ${user?.name ?? '...'}`}
        showBack
        rightSlot={
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest text-primary transition-opacity hover:opacity-80"
            data-testid="profile-notifications-button"
          >
            <Bell size={20} />
          </button>
        }
      />

      <main className="mx-auto max-w-2xl space-y-section-gap px-container-margin py-section-gap">
        {isLoading && <ListSkeleton rows={3} />}

        {user && (
          <>
            <section className="flex flex-col items-center space-y-4 text-center">
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-tr from-primary to-secondary-container p-1 shadow-lg">
                <div className="h-full w-full overflow-hidden rounded-full border-4 border-surface-container-lowest">
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                </div>
                <button
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-primary text-on-primary shadow-md transition-opacity hover:opacity-90"
                  data-testid="profile-edit-avatar-button"
                >
                  <Pencil size={14} />
                </button>
              </div>
              <div>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface" data-testid="profile-name">
                  {user.name}
                </h2>
                {!user.isPremium && (
                  <button className="mt-1 inline-block font-body-sm text-body-sm text-primary hover:underline" data-testid="profile-go-premium-link">
                    Go Premium
                  </button>
                )}
              </div>
            </section>

            <section className="grid grid-cols-3 gap-element-gap">
              <div className="flex flex-col items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-card-padding shadow-sm transition-transform hover:scale-[0.98]">
                <Ruler size={26} className="mb-2 text-primary-container" />
                <p className="font-metric-display text-metric-display text-on-surface">
                  {user.heightCm}
                  <span className="ml-1 font-body-sm text-body-sm text-outline">cm</span>
                </p>
                <p className="mt-1 font-label-bold text-label-bold uppercase text-on-surface-variant">Height</p>
              </div>
              <button
                onClick={() => setWeightModalOpen(true)}
                data-testid="profile-weight-card"
                className="flex flex-col items-center justify-center rounded-lg bg-primary p-card-padding shadow-[0px_10px_30px_rgba(115,103,240,0.2)] transition-transform hover:scale-[0.98]"
              >
                <Weight size={26} className="mb-2 text-on-primary" />
                <p className="font-metric-display text-metric-display text-on-primary">
                  {user.currentWeightKg}
                  <span className="ml-1 font-body-sm text-body-sm text-primary-fixed">kg</span>
                </p>
                <p className="mt-1 font-label-bold text-label-bold uppercase text-primary-fixed">Weight</p>
              </button>
              <div className="flex flex-col items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-card-padding shadow-sm transition-transform hover:scale-[0.98]">
                <Cake size={26} className="mb-2 text-secondary" />
                <p className="font-metric-display text-metric-display text-on-surface">
                  {user.age}
                  <span className="ml-1 font-body-sm text-body-sm text-outline">yrs</span>
                </p>
                <p className="mt-1 font-label-bold text-label-bold uppercase text-on-surface-variant">Age</p>
              </div>
            </section>

            {leaderboard && <LeaderboardCard entries={leaderboard} />}
            {reminders && <RemindersCard reminders={reminders} />}

            {!user.isPremium && (
              <section
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary-container p-card-padding text-on-primary shadow-glow"
                data-testid="profile-subscription-card"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles size={20} />
                  <h3 className="font-headline-md text-headline-md">Vitality Premium</h3>
                </div>
                <p className="mb-4 font-body-sm text-body-sm opacity-90">Unlock premium meditations, advanced insights and more.</p>
                <button
                  className="rounded-full bg-white/20 px-6 py-2 font-label-bold text-label-bold backdrop-blur-md transition-colors hover:bg-white/30"
                  data-testid="profile-upgrade-button"
                >
                  Upgrade Now
                </button>
              </section>
            )}

            <section className="space-y-4">
              <h3 className="px-2 font-headline-md text-headline-md text-on-surface">Activity &amp; Settings</h3>
              <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant/10 bg-surface-container-lowest shadow-soft">
                <button
                  className="flex items-center justify-between border-b border-outline-variant/10 p-card-padding transition-colors hover:bg-surface-container/50"
                  data-testid="profile-achievements-button"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed/30 text-primary">
                      <Award size={18} />
                    </div>
                    <span className="font-body-lg text-body-lg font-semibold text-on-surface">My Achievements</span>
                  </div>
                  <ChevronRight size={18} className="text-outline" />
                </button>
                <button
                  className="flex items-center justify-between border-b border-outline-variant/10 p-card-padding transition-colors hover:bg-surface-container/50"
                  data-testid="profile-health-history-button"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed/30 text-secondary">
                      <TrendingUp size={18} />
                    </div>
                    <span className="font-body-lg text-body-lg font-semibold text-on-surface">Health Score History</span>
                  </div>
                  <ChevronRight size={18} className="text-outline" />
                </button>
                <button
                  className="flex items-center justify-between p-card-padding transition-colors hover:bg-surface-container/50"
                  data-testid="profile-settings-button"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
                      <Settings size={18} />
                    </div>
                    <span className="font-body-lg text-body-lg font-semibold text-on-surface">App Settings</span>
                  </div>
                  <ChevronRight size={18} className="text-outline" />
                </button>
              </div>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-DEFAULT bg-error-container px-6 py-4 font-label-bold text-label-bold uppercase text-on-error-container shadow-sm transition-opacity hover:opacity-90"
                data-testid="profile-logout-button"
              >
                <LogOut size={18} />
                Logout
              </button>
            </section>
          </>
        )}
      </main>

      {weightModalOpen && user && <EditWeightModal currentWeightKg={user.currentWeightKg} onClose={() => setWeightModalOpen(false)} />}
    </div>
  );
}
