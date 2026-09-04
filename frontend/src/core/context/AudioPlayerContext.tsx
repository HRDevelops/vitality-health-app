import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Podcast } from '../../types/domain';
import { useLogPodcastListen } from '../../services/api/podcasts';

interface AudioPlayerContextValue {
  currentTrack: Podcast | null;
  isPlaying: boolean;
  progressMap: Record<string, number>;
  playTrack: (track: Podcast) => void;
  togglePlayPause: () => void;
  closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);
const PROGRESS_KEY = 'vitality_podcast_progress';

function readProgress(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveProgress(map: Record<string, number>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>(() => readProgress());
  const audioRef = useRef<HTMLAudioElement>(null);
  const logListen = useLogPodcastListen();

  const playTrack = (track: Podcast) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying((p) => !p);
      return;
    }
    logListen.mutate(track.id);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => setIsPlaying((p) => !p);

  const closePlayer = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (!audio.src.includes(currentTrack.audioUrl)) {
      audio.src = currentTrack.audioUrl;
      const saved = readProgress()[currentTrack.id];
      if (saved) audio.currentTime = saved;
    }
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      if (!currentTrack) return;
      setProgressMap((prev) => {
        const updated = { ...prev, [currentTrack.id]: audio.currentTime };
        saveProgress(updated);
        return updated;
      });
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentTrack]);

  return (
    <AudioPlayerContext.Provider value={{ currentTrack, isPlaying, progressMap, playTrack, togglePlayPause, closePlayer }}>
      {children}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} data-testid="podcast-audio-element" />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
}
