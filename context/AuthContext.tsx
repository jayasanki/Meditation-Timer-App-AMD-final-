 
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};