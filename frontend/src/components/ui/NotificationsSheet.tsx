import { useState } from 'react';
import { X, TrendingUp, Droplet, Headphones, CheckCheck } from 'lucide-react';

interface NotificationsSheetProps {
  onClose: () => void;
}

const NOTIFICATIONS = [
  { id: 'n1', message: 'Grace, Liam Carter just passed you on the leaderboard!', time: '2h ago', icon: TrendingUp },
  { id: 'n2', message: 'Hydration Alert: 500 ml left to reach your daily goal.', time: '4h ago', icon: Droplet },
  { id: 'n3', message: "New Episode: 'The Twilight Zone' is now streaming.", time: 'Yesterday', icon: Headphones },
];

export default function NotificationsSheet({ onClose }: NotificationsSheetProps) {
  const [readIds, setReadIds] = useState<string[]>([]);

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end bg-[rgba(28,26,39,0.45)] backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      data-testid="notifications-sheet-overlay"
    >
      <div
        className="flex h-full w-[85%] max-w-sm flex-col bg-surface-container-lowest p-container-margin shadow-2xl animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
        data-testid="notifications-sheet"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Notifications</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-surface-container p-2 text-on-surface transition-transform hover:scale-95"
            data-testid="notifications-close-button"
          >
            <X size={18} />
          </button>
        </div>
        <button
          onClick={() => setReadIds(NOTIFICATIONS.map((n) => n.id))}
          className="mb-4 flex items-center gap-2 self-start font-label-bold text-label-bold text-primary hover:underline"
          data-testid="notifications-mark-all-read"
        >
          <CheckCheck size={14} />
          Mark all as read
        </button>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {NOTIFICATIONS.map((n) => {
            const Icon = n.icon;
            const isRead = readIds.includes(n.id);
            return (
              <div
                key={n.id}
                data-testid={`notification-${n.id}`}
                className={`flex gap-3 rounded-2xl p-4 transition-colors ${isRead ? 'bg-surface-container-low' : 'bg-primary-fixed/40'}`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-body-sm text-body-sm text-on-surface">{n.message}</p>
                  <p className="mt-1 font-label-bold text-[10px] uppercase text-outline">{n.time}</p>
                </div>
                {!isRead && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" data-testid={`notification-unread-dot-${n.id}`} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
