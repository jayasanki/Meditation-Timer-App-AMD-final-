export class MeditationTimer {
  private duration: number; // in seconds
  private remainingTime: number;
  private isRunning: boolean;
  private isPaused: boolean;
  private startTime: number | null;
  private pauseTime: number | null;
  private totalPausedTime: number;
  private timerId: NodeJS.Timeout | null;
  private onTick: ((remaining: number) => void) | null;
  private onComplete: (() => void) | null;
  private onPause?: (() => void) | null;
  private onResume?: (() => void) | null;

  constructor(
    duration: number, // in minutes
    onTick?: (remaining: number) => void,
    onComplete?: () => void,
    onPause?: () => void,
    onResume?: () => void
  ) {
    this.duration = duration * 60; // Convert to seconds
    this.remainingTime = this.duration;
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.pauseTime = null;
    this.totalPausedTime = 0;
    this.timerId = null;
    this.onTick = onTick || null;
    this.onComplete = onComplete || null;
    this.onPause = onPause || null;
    this.onResume = onResume || null;
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    
    // Calculate start time considering previous pauses
    const now = Date.now();
    if (this.startTime === null) {
      this.startTime = now;
    } else {
      // Resume from where we left off
      const pausedDuration = now - (this.pauseTime || now);
      this.totalPausedTime += pausedDuration;
      this.pauseTime = null;
    }

    if (this.onResume) {
      this.onResume();
    }

    this.timerId = setInterval(() => {
      if (this.startTime && !this.isPaused) {
        const elapsed = Math.floor((Date.now() - this.startTime - this.totalPausedTime) / 1000);
        this.remainingTime = Math.max(0, this.duration - elapsed);

        if (this.onTick) {
          this.onTick(this.remainingTime);
        }

        if (this.remainingTime <= 0) {
          this.complete();
        }
      }
    }, 100);
  }

  pause(): void {
    if (!this.isRunning || this.isPaused || !this.timerId) return;

    this.isPaused = true;
    this.pauseTime = Date.now();
    
    if (this.onPause) {
      this.onPause();
    }
  }

  resume(): void {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
    const now = Date.now();
    const pausedDuration = now - (this.pauseTime || now);
    this.totalPausedTime += pausedDuration;
    this.pauseTime = null;

    if (this.onResume) {
      this.onResume();
    }
  }

  reset(): void {
    this.stop();
    this.remainingTime = this.duration;
    this.startTime = null;
    this.pauseTime = null;
    this.totalPausedTime = 0;
    this.isPaused = false;

    if (this.onTick) {
      this.onTick(this.remainingTime);
    }
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private complete(): void {
    this.stop();
    this.remainingTime = 0;

    if (this.onComplete) {
      this.onComplete();
    }
  }

  // Getters for current state
  getRemainingTime(): number {
    return this.remainingTime;
  }

  getElapsedTime(): number {
    return this.duration - this.remainingTime;
  }

  getProgress(): number {
    return 1 - (this.remainingTime / this.duration);
  }

  isTimerRunning(): boolean {
    return this.isRunning;
  }

  isTimerPaused(): boolean {
    return this.isPaused;
  }

  getFormattedRemainingTime(): string {
    return formatTime(this.remainingTime);
  }

  getFormattedElapsedTime(): string {
    return formatTime(this.getElapsedTime());
  }

  getTotalDuration(): number {
    return this.duration;
  }

  // Method to add extra time
  addTime(seconds: number): void {
    this.duration += seconds;
    this.remainingTime += seconds;
    
    if (this.onTick) {
      this.onTick(this.remainingTime);
    }
  }

  // Method to skip time
  skipTime(seconds: number): void {
    this.remainingTime = Math.max(0, this.remainingTime - seconds);
    
    if (this.onTick) {
      this.onTick(this.remainingTime);
    }

    if (this.remainingTime <= 0) {
      this.complete();
    }
  }

  // Method to get timer statistics
  getStats(): {
    totalDuration: number;
    elapsedTime: number;
    remainingTime: number;
    progress: number;
    isRunning: boolean;
    isPaused: boolean;
  } {
    return {
      totalDuration: this.duration,
      elapsedTime: this.getElapsedTime(),
      remainingTime: this.remainingTime,
      progress: this.getProgress(),
      isRunning: this.isRunning,
      isPaused: this.isPaused
    };
  }

  // Cleanup method
  destroy(): void {
    this.stop();
    this.onTick = null;
    this.onComplete = null;
    this.onPause = null;
    this.onResume = null;
  }
}

// Utility functions
export const formatTime = (seconds: number): string => {
  if (seconds < 0) seconds = 0;
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeWithHours = (seconds: number): string => {
  if (seconds < 0) seconds = 0;
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const parseTime = (timeString: string): number => {
  // Parse time string like "5:30" or "1:25:30" to seconds
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  
  return 0;
};

export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(1, Math.max(0, current / total));
};

export const getTimeComponents = (seconds: number): { hours: number; minutes: number; seconds: number } => {
  return {
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: Math.floor(seconds % 60)
  };
};

export const presetDurations = [5, 10, 15, 20, 30] as const;

export type PresetDuration = typeof presetDurations[number];

export const isPresetDuration = (duration: number): duration is PresetDuration => {
  return presetDurations.includes(duration as PresetDuration);
};

// Timer factory function
export const createMeditationTimer = (
  duration: number,
  callbacks: {
    onTick?: (remaining: number) => void;
    onComplete?: () => void;
    onPause?: () => void;
    onResume?: () => void;
  } = {}
): MeditationTimer => {
  return new MeditationTimer(
    duration,
    callbacks.onTick,
    callbacks.onComplete,
    callbacks.onPause,
    callbacks.onResume
  );
};

// Timer manager for multiple timers
export class TimerManager {
  private timers: Map<string, MeditationTimer> = new Map();

  createTimer(id: string, duration: number, callbacks?: any): MeditationTimer {
    const timer = createMeditationTimer(duration, callbacks);
    this.timers.set(id, timer);
    return timer;
  }

  getTimer(id: string): MeditationTimer | undefined {
    return this.timers.get(id);
  }

  removeTimer(id: string): boolean {
    const timer = this.timers.get(id);
    if (timer) {
      timer.destroy();
      return this.timers.delete(id);
    }
    return false;
  }

  pauseAll(): void {
    this.timers.forEach(timer => {
      if (timer.isTimerRunning() && !timer.isTimerPaused()) {
        timer.pause();
      }
    });
  }

  resumeAll(): void {
    this.timers.forEach(timer => {
      if (timer.isTimerRunning() && timer.isTimerPaused()) {
        timer.resume();
      }
    });
  }

  stopAll(): void {
    this.timers.forEach(timer => {
      timer.stop();
    });
  }

  destroyAll(): void {
    this.timers.forEach(timer => {
      timer.destroy();
    });
    this.timers.clear();
  }

  getTimerCount(): number {
    return this.timers.size;
  }
}

// Export a singleton instance for global timer management
export const globalTimerManager = new TimerManager();