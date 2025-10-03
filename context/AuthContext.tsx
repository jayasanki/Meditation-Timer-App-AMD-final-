import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MeditationSession, TimerState, MeditationStats, PresetDuration } from '@/types';
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
  
  // Complete initial stats with all required properties
  const [stats, setStats] = useState<MeditationStats>({
    totalSessions: 0,
    totalMinutes: 0,
    averageSessionTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteDuration: 10, // Default preset duration
    sessionsThisWeek: 0,
    sessionsThisMonth: 0
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

    // Calculate all required statistics
    const currentStreak = calculateCurrentStreak(completedSessions);
    const longestStreak = calculateLongestStreak(completedSessions);
    const favoriteDuration = calculateFavoriteDuration(completedSessions);
    const sessionsThisWeek = calculateSessionsThisWeek(completedSessions);
    const sessionsThisMonth = calculateSessionsThisMonth(completedSessions);

    // Set complete stats object with all required properties
    setStats({
      totalSessions,
      totalMinutes,
      averageSessionTime,
      currentStreak,
      longestStreak,
      favoriteDuration,
      sessionsThisWeek,
      sessionsThisMonth
    });
  };

  const calculateFavoriteDuration = (completedSessions: MeditationSession[]): PresetDuration => {
    if (completedSessions.length === 0) return 10; // Default to 10 minutes

    const durationCount: Record<number, number> = {};
    
    // Count occurrences of each duration
    completedSessions.forEach(session => {
      const duration = session.duration;
      durationCount[duration] = (durationCount[duration] || 0) + 1;
    });

    // Find the duration with the highest count
    let favoriteDuration: PresetDuration = 10;
    let maxCount = 0;

    Object.entries(durationCount).forEach(([duration, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteDuration = parseInt(duration) as PresetDuration;
      }
    });

    return favoriteDuration;
  };

  const calculateSessionsThisWeek = (completedSessions: MeditationSession[]): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);
    
    return completedSessions.filter(session => {
      const sessionDate = new Date(session.completedAt || session.createdAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate >= oneWeekAgo;
    }).length;
  };

  const calculateSessionsThisMonth = (completedSessions: MeditationSession[]): number => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);
    
    return completedSessions.filter(session => {
      const sessionDate = new Date(session.completedAt || session.createdAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate >= oneMonthAgo;
    }).length;
  };

  const calculateCurrentStreak = (completedSessions: MeditationSession[]): number => {
    if (completedSessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort sessions by date (newest first)
    const sortedSessions = [...completedSessions].sort((a, b) => 
      new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime()
    );

    let currentDate = today;
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].completedAt || sortedSessions[i].createdAt);
      sessionDate.setHours(0, 0, 0, 0);

      const diffTime = currentDate.getTime() - sessionDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Session from today, continue checking
        continue;
      } else if (diffDays === 1) {
        // Session from yesterday, increment streak
        streak++;
        currentDate = sessionDate;
      } else {
        // Gap in streak, break
        break;
      }
    }

    // If we have sessions from today, add 1 to streak
    const hasSessionToday = sortedSessions.some(session => {
      const sessionDate = new Date(session.completedAt || session.createdAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    return hasSessionToday ? streak + 1 : streak;
  };

  const calculateLongestStreak = (completedSessions: MeditationSession[]): number => {
    if (completedSessions.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 1;

    // Sort sessions by date (oldest first)
    const sortedSessions = [...completedSessions].sort((a, b) => 
      new Date(a.completedAt || a.createdAt).getTime() - new Date(b.completedAt || b.createdAt).getTime()
    );

    for (let i = 1; i < sortedSessions.length; i++) {
      const currentDate = new Date(sortedSessions[i].completedAt || sortedSessions[i].createdAt);
      currentDate.setHours(0, 0, 0, 0);
      
      const previousDate = new Date(sortedSessions[i - 1].completedAt || sortedSessions[i - 1].createdAt);
      previousDate.setHours(0, 0, 0, 0);

      const diffTime = currentDate.getTime() - previousDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive days
        currentStreak++;
      } else if (diffDays === 0) {
        // Same day, don't break streak but don't increment either
        continue;
      } else {
        // Gap in streak
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, currentStreak);
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await authService.login(email, password);
      setUser(userData);
      await loadSessions(userData.id);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const userData = await authService.register(email, password, name);
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setSessions([]);
      setTimerState({
        isRunning: false,
        isPaused: false,
        timeRemaining: 0,
        totalDuration: 0
      });
      // Clear local storage
      await AsyncStorage.multiRemove([STORAGE_KEYS.TIMER_STATE, STORAGE_KEYS.USER_SESSIONS]);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (sessionData: Omit<MeditationSession, 'id' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const session: Omit<MeditationSession, 'id'> = {
        ...sessionData,
        userId: user.id
      };

      const sessionId = await meditationApi.createSession(session);
      const newSession: MeditationSession = {
        ...session,
        id: sessionId
      };

      setSessions(prev => {
        const updatedSessions = [newSession, ...prev];
        saveSessionsToStorage(updatedSessions);
        return updatedSessions;
      });
    } catch (error) {
      // Fallback to local storage if online fails
      const localSession: MeditationSession = {
        ...sessionData,
        id: `local_${Date.now()}`,
        userId: user.id
      };

      setSessions(prev => {
        const updatedSessions = [localSession, ...prev];
        saveSessionsToStorage(updatedSessions);
        return updatedSessions;
      });
      throw error;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<MeditationSession>) => {
    try {
      await meditationApi.updateSession(sessionId, updates);
      setSessions(prev => {
        const updatedSessions = prev.map(session => 
          session.id === sessionId ? { ...session, ...updates } : session
        );
        saveSessionsToStorage(updatedSessions);
        return updatedSessions;
      });
    } catch (error) {
      throw error;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await meditationApi.deleteSession(sessionId);
      setSessions(prev => {
        const updatedSessions = prev.filter(session => session.id !== sessionId);
        saveSessionsToStorage(updatedSessions);
        return updatedSessions;
      });
    } catch (error) {
      throw error;
    }
  };

  const refreshSessions = async () => {
    if (!user) return;
    try {
      await loadSessions(user.id);
    } catch (error) {
      throw error;
    }
  };

  const getSessionStats = (): MeditationStats => {
    return stats;
  };

  const updateUserProfile = async (updates: { displayName?: string }) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await authService.updateProfile(updates);
      setUser(prev => prev ? { ...prev, name: updates.displayName || prev.name } : null);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    sessions,
    timerState,
    loading,
    stats,
    login,
    register,
    logout,
    addSession,
    updateSession,
    deleteSession,
    setTimerState,
    refreshSessions,
    getSessionStats,
    updateUserProfile,
    resetPassword
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