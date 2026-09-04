import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Podcast } from '../../types/domain';
import { useLogPodcastListen } from '../../services/api/podcasts';

interface AudioPlayerContextValue {
  currentTrack: Podcast | null;
  isPlaying: boolean;
  playTrack: (track: Podcast) => void;
  togglePlayPause: () => void;
  closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const logListen = useLogPodcastListen();

  const playTrack = (track: Podcast) => {
    setCurrentTrack((current) => {
      if (current?.id === track.id) {
        setIsPlaying((p) => !p);
        return current;
      }
      logListen.mutate(track.id);
      setIsPlaying(true);
      return track;
    });
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
    }
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

  return (
    <AudioPlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, togglePlayPause, closePlayer }}>
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
