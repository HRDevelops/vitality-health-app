import { Play, Pause, X } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlayPause, closePlayer } = useAudioPlayer();

  if (!currentTrack) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-[calc(28rem-2rem)] items-center gap-3 rounded-2xl bg-inverse-surface px-3 py-2.5 text-inverse-on-surface shadow-[0px_10px_30px_rgba(28,26,39,0.35)] animate-fade-slide-up"
      data-testid="mini-player"
    >
      <img src={currentTrack.imageUrl} alt={currentTrack.title} className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-body-sm text-body-sm font-semibold" data-testid="mini-player-title">
          {currentTrack.title}
        </p>
        <p className="truncate font-label-bold text-[10px] uppercase text-inverse-on-surface/70">{currentTrack.category}</p>
      </div>
      <button
        onClick={togglePlayPause}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-inverse-on-surface/15 transition-transform active:scale-90"
        data-testid="mini-player-toggle-button"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button
        onClick={closePlayer}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-inverse-on-surface/15 transition-transform active:scale-90"
        data-testid="mini-player-close-button"
        aria-label="Close player"
      >
        <X size={16} />
      </button>
    </div>
  );
}
