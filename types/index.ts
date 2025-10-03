// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Meditation Session types
export interface MeditationSession {
  id: string;
  userId: string;
  duration: number; // in minutes (planned duration)
  actualDuration: number; // in seconds (actual time spent)
  completed: boolean;
  notes?: string;
  mood?: MoodType;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface CreateSessionData {
  duration: number;
  notes?: string;
  mood?: MoodType;
}

export interface UpdateSessionData {
  notes?: string;
  mood?: MoodType;
  completed?: boolean;
}

// Timer related types
export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  totalDuration: number; // in seconds
  startTime?: number; // timestamp when timer started
  endTime?: number; // timestamp when timer will end
}

export interface TimerConfig {
  duration: number; // in minutes
  autoStart?: boolean;
  showProgress?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

// App Configuration types
export interface AppSettings {
  notifications: {
    enabled: boolean;
    dailyReminder: boolean;
    reminderTime: string; // HH:MM format
    sessionReminders: boolean;
  };
  sounds: {
    enabled: boolean;
    startSound: boolean;
    endSound: boolean;
    intervalSounds: boolean;
  };
  theme: {
    darkMode: boolean;
    primaryColor: string;
    calmingColors: boolean;
  };
  privacy: {
    saveSessionHistory: boolean;
    analyticsEnabled: boolean;
  };
}

// Statistics types
export interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionTime: number;
  favoriteDuration: PresetDuration;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
}

export interface WeeklyStats {
  week: string; // ISO week format
  sessions: number;
  totalMinutes: number;
  averageDuration: number;
}

// Enums and Union types
export type PresetDuration = 5 | 10 | 15 | 20 | 30 | 45 | 60;

export type MoodType = 
  | 'calm' 
  | 'focused' 
  | 'energized' 
  | 'relaxed' 
  | 'anxious' 
  | 'tired' 
  | 'neutral';

export type ThemeType = 'light' | 'dark' | 'auto';

export type SoundType = 'bell' | 'bowl' | 'nature' | 'silent';

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Timer: { duration?: number };
  History: undefined;
  SessionDetail: { sessionId: string };
  Profile: undefined;
  Settings: undefined;
  Statistics: undefined;
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Firebase specific types
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface FirebaseSession {
  userId: string;
  duration: number;
  actualDuration: number;
  completed: boolean;
  notes?: string;
  mood?: string;
  createdAt: any; // Firestore Timestamp
  completedAt?: any; // Firestore Timestamp
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Component Prop types
export interface DurationButtonProps {
  duration: PresetDuration;
  selected: boolean;
  onPress: (duration: PresetDuration) => void;
}

export interface SessionCardProps {
  session: MeditationSession;
  onPress: (session: MeditationSession) => void;
  onDelete: (sessionId: string) => void;
}

export interface TimerDisplayProps {
  timeRemaining: number;
  totalDuration: number;
  isRunning: boolean;
}

export interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionTime: number;
  currentStreak: number;
  longestStreak: number;
  favoriteDuration: PresetDuration;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
}