// utils/statsCalculator.ts
import { MeditationSession, MeditationStats, PresetDuration } from '@/types';

export const calculateStats = (sessions: MeditationSession[]): MeditationStats => {
  const completedSessions = sessions.filter(session => session.completed);
  
  // Basic calculations
  const totalSessions = completedSessions.length;
  const totalMinutes = Math.floor(
    completedSessions.reduce((sum, session) => sum + session.actualDuration, 0) / 60
  );
  const averageSessionTime = totalSessions > 0 ? Math.floor(totalMinutes / totalSessions) : 0;
  
  // Default values for missing calculations
  const defaultStats: MeditationStats = {
    totalSessions,
    totalMinutes,
    averageSessionTime,
    currentStreak: calculateCurrentStreak(completedSessions),
    longestStreak: calculateLongestStreak(completedSessions),
    favoriteDuration: calculateFavoriteDuration(completedSessions),
    sessionsThisWeek: calculateSessionsThisWeek(completedSessions),
    sessionsThisMonth: calculateSessionsThisMonth(completedSessions)
  };
  
  return defaultStats;
};

// Helper functions
const calculateCurrentStreak = (sessions: MeditationSession[]): number => {
  // Implement streak calculation logic
  return 0; // Placeholder
};

const calculateLongestStreak = (sessions: MeditationSession[]): number => {
  // Implement longest streak calculation
  return 0; // Placeholder
};

const calculateFavoriteDuration = (sessions: MeditationSession[]): PresetDuration => {
  // Find most used duration
  const durationCount: Record<number, number> = {};
  sessions.forEach(session => {
    durationCount[session.duration] = (durationCount[session.duration] || 0) + 1;
  });
  
  const favorite = Object.entries(durationCount).reduce((a, b) => 
    a[1] > b[1] ? a : b
  );
  
  return parseInt(favorite[0]) as PresetDuration;
};

const calculateSessionsThisWeek = (sessions: MeditationSession[]): number => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return sessions.filter(session => 
    new Date(session.completedAt || session.createdAt) >= oneWeekAgo
  ).length;
};

const calculateSessionsThisMonth = (sessions: MeditationSession[]): number => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  return sessions.filter(session => 
    new Date(session.completedAt || session.createdAt) >= oneMonthAgo
  ).length;
};