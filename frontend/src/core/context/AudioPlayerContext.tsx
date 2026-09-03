import { createContext, useContext, useState, ReactNode } from 'react';
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

  return (
    <AudioPlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, togglePlayPause, closePlayer }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return ctx;
}
