 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MeditationSession, TimerState, MeditationStats } from '@/types';
import { authService } from '@/services/authServices';
import { meditationApi } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  sessions: MeditationSession[];
  timerState: TimerState;
  loading: boolean;
  stats: MeditationStats;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  addSession: (session: Omit<MeditationSession, 'id' | 'userId'>) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<MeditationSession>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  setTimerState: (state: TimerState) => void;
  refreshSessions: () => Promise<void>;
  getSessionStats: () => MeditationStats;
  updateUserProfile: (updates: { displayName?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AsyncStorage keys
const STORAGE_KEYS = {
  TIMER_STATE: 'meditation_timer_state',
  USER_SESSIONS: 'meditation_user_sessions'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    timeRemaining: 0,
    totalDuration: 0
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MeditationStats>({
    totalSessions: 0,
    totalMinutes: 0,
    averageSessionTime: 0,
    currentStreak: 0,
    longestStreak: 0
  });

  useEffect(() => {
    // Check if user is logged in on app start
    const initAuth = async () => {
      try {
        // Load timer state from AsyncStorage
        await loadTimerState();
        
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await loadSessions(currentUser.id);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    // Update statistics when sessions change
    if (user) {
      updateStats();
    }
  }, [sessions, user]);

  useEffect(() => {
    // Save timer state to AsyncStorage when it changes
    saveTimerState();
  }, [timerState]);

  const loadTimerState = async () => {
    try {
      const savedTimerState = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_STATE);
      if (savedTimerState) {
        setTimerState(JSON.parse(savedTimerState));
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  };

  const saveTimerState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(timerState));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

   const loadSessions = async (userId: string) => {
    try {
      const userSessions = await meditationApi.getSessions(userId);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      // Fallback to local storage if online fails
      await loadSessionsFromStorage();
    }
  };
   const loadSessionsFromStorage = async () => {
    try {
      const savedSessions = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSIONS);
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }
    } catch (error) {
      console.error('Error loading sessions from storage:', error);
    }
  };

  const saveSessionsToStorage = async (sessionsToSave: MeditationSession[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSIONS, JSON.stringify(sessionsToSave));
    } catch (error) {
      console.error('Error saving sessions to storage:', error);
    }
  };

  const updateStats = () => {
    const completedSessions = sessions.filter(session => session.completed);
    const totalSessions = completedSessions.length;
    const totalMinutes = Math.floor(
      completedSessions.reduce((sum, session) => sum + session.actualDuration, 0) / 60
    );
    const averageSessionTime = totalSessions > 0 ? Math.floor(totalMinutes / totalSessions) : 0;

    // Calculate streak (simplified version)
    const currentStreak = calculateCurrentStreak(completedSessions);
    const longestStreak = calculateLongestStreak(completedSessions);

    setStats({
      totalSessions,
      totalMinutes,
      averageSessionTime,
      currentStreak,
      longestStreak
    });
  };

   const calculateCurrentStreak = (completedSessions: MeditationSession[]): number => {
    if (completedSessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < completedSessions.length; i++) {
      const sessionDate = new Date(completedSessions[i].completedAt || completedSessions[i].createdAt);
      sessionDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - sessionDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateLongestStreak = (completedSessions: MeditationSession[]): number => {
    if (completedSessions.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 1;

    // Sort sessions by date
    const sortedSessions = [...completedSessions].sort((a, b) => 
      new Date(a.completedAt || a.createdAt).getTime() - new Date(b.completedAt || b.createdAt).getTime()
    );

    for (let i = 1; i < sortedSessions.length; i++) {
      const currentDate = new Date(sortedSessions[i].completedAt || sortedSessions[i].createdAt);
      const previousDate = new Date(sortedSessions[i - 1].completedAt || sortedSessions[i - 1].createdAt);

      const diffTime = currentDate.getTime() - previousDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, currentStreak);
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};