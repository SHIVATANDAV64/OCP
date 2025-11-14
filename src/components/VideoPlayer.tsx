import { useState, useEffect, useRef } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    // Auto-save progress every 10 seconds
    const interval = setInterval(() => {
      if (playing && onProgress && videoRef.current) {
        onProgress(videoRef.current.currentTime / videoRef.current.duration);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [playing, onProgress]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Play error:', err);
        });
      }
      setPlaying(!playing);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const newPlayed = videoRef.current.currentTime / videoRef.current.duration;
      setPlayed(newPlayed);
      
      if (onProgress) {
        onProgress(newPlayed);
      }

      // Check if video is near completion (95%)
      if (newPlayed >= 0.95 && onComplete) {
        onComplete();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      console.log('Video loaded, duration:', videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    const newPlayed = value[0] / 100;
    if (videoRef.current) {
      videoRef.current.currentTime = newPlayed * videoRef.current.duration;
      setPlayed(newPlayed);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  const handleError = (e: Event) => {
    const target = e.target as HTMLVideoElement;
    console.error('Video error:', target.error);
    let errorMsg = 'Failed to load video';
    if (target.error) {
      switch (target.error.code) {
        case target.error.MEDIA_ERR_ABORTED:
          errorMsg = 'Video loading was aborted';
          break;
        case target.error.MEDIA_ERR_NETWORK:
          errorMsg = 'Network error loading video';
          break;
        case target.error.MEDIA_ERR_DECODE:
          errorMsg = 'Error decoding video';
          break;
        case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMsg = 'Video format not supported';
          break;
      }
    }
    setError(errorMsg);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden bg-[#2C2416] border-[#D4A574]/30">
      <div className="relative aspect-video max-w-4xl mx-auto">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#2C2416]">
            <div className="text-center">
              <p className="text-[#D4A574] mb-4">{error}</p>
              <p className="text-[#8B7355] text-sm break-all px-4">URL: {url}</p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                setPlaying(false);
                if (onComplete) onComplete();
              }}
              onError={handleError}
              crossOrigin="anonymous"
            >
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </>
        )}
        
        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C2416]/90 to-transparent p-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[played * 100]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="cursor-pointer [&_[role=slider]]:bg-[#D4A574] [&_[role=slider]]:border-[#D4A574] [&_[role=slider]]:hover:bg-[#8B7355] [&_[role=slider]]:hover:border-[#8B7355] [&_[data-radix-slider-track]]:bg-[#F5E8DE]/30 [&_[data-radix-slider-range]]:bg-[#D4A574]"
            />
            <div className="flex justify-between text-xs text-[#D4A574] mt-2">
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
                className="text-[#D4A574] hover:bg-[#D4A574]/20 hover:text-[#2C2416] rounded-full"
              >
                {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleMuteToggle}
                  variant="ghost"
                  size="icon"
                  className="text-[#D4A574] hover:bg-[#D4A574]/20 hover:text-[#2C2416] rounded-full"
                >
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <div className="w-24">
                  <Slider
                    value={[muted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-[#D4A574] [&_[role=slider]]:border-[#D4A574] [&_[role=slider]]:hover:bg-[#8B7355] [&_[role=slider]]:hover:border-[#8B7355] [&_[data-radix-slider-track]]:bg-[#F5E8DE]/30 [&_[data-radix-slider-range]]:bg-[#D4A574]"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleFullscreen}
              variant="ghost"
              size="icon"
              className="text-[#D4A574] hover:bg-[#D4A574]/20 hover:text-[#2C2416] rounded-full"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}