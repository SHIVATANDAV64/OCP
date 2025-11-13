import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  url: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  initialProgress?: number;
}

export default function VideoPlayer({ url, onProgress, onComplete, initialProgress = 0 }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [playerRef, setPlayerRef] = useState<ReactPlayer | null>(null);

  useEffect(() => {
    // Auto-save progress every 10 seconds
    const interval = setInterval(() => {
      if (playing && onProgress) {
        onProgress(played);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [playing, played, onProgress]);

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    setPlayed(state.played);
    
    // Check if video is near completion (95%)
    if (state.played >= 0.95 && onComplete) {
      onComplete();
    }
  };

  const handleSeek = (value: number[]) => {
    const newPlayed = value[0] / 100;
    setPlayed(newPlayed);
    playerRef?.seekTo(newPlayed);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
    setMuted(value[0] === 0);
  };

  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    const playerElement = document.querySelector('.react-player');
    if (playerElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerElement.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden bg-black">
      <div className="relative aspect-video">
        <ReactPlayer
          ref={(ref) => setPlayerRef(ref)}
          className="react-player"
          url={url}
          playing={playing}
          volume={volume}
          muted={muted}
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onDuration={setDuration}
          onEnded={() => {
            setPlaying(false);
            if (onComplete) onComplete();
          }}
          config={{
            youtube: {
              playerVars: { showinfo: 1 }
            }
          }}
        />
        
        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[played * 100]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white mt-1">
              <span>{formatTime(played * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePlayPause}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleMuteToggle}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <div className="w-24">
                  <Slider
                    value={[muted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleFullscreen}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}