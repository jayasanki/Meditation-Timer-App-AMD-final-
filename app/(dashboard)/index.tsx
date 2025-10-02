import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { PresetDuration } from '@/types';

export default function DashboardScreen() {
  const { user, sessions, timerState, setTimerState, stats, refreshSessions, loading } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState<PresetDuration>(10);
  const [refreshing, setRefreshing] = useState(false);

  const presetDurations: PresetDuration[] = [5, 10, 15, 20, 30];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSessions();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const startMeditation = () => {
    // Set timer state for the meditation session
    setTimerState({
      isRunning: false,
      isPaused: false,
      timeRemaining: selectedDuration * 60, // Convert to seconds
      totalDuration: selectedDuration * 60
    });
    
    // Navigate to timer screen
    router.push('/(dashboard)/timer');
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Every moment is a fresh beginning.",
      "Peace comes from within.",
      "Breathe in calm, breathe out stress.",
      "The present moment is filled with joy and happiness.",
      "You are exactly where you need to be."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
        <Text style={styles.loadingText}>Loading your meditation journey...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.userName}>{user?.name || 'Meditator'} 👋</Text>
        <Text style={styles.subtitle}>{getMotivationalQuote()}</Text>
      </View>

      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>🧘</Text>
            </View>
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>⏱️</Text>
            </View>
            <Text style={styles.statNumber}>{formatTime(stats.totalMinutes)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>📊</Text>
            </View>
            <Text style={styles.statNumber}>
              {stats.averageSessionTime || 0}m
            </Text>
            <Text style={styles.statLabel}>Avg. Session</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>🔥</Text>
            </View>
            <Text style={styles.statNumber}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      {/* Quick Start Section */}
      <View style={styles.quickStartSection}>
        <Text style={styles.sectionTitle}>Quick Meditation</Text>
        <Text style={styles.sectionSubtitle}>Choose your session duration</Text>
        
        <View style={styles.durationButtons}>
          {presetDurations.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                selectedDuration === duration && styles.durationButtonSelected
              ]}
              onPress={() => setSelectedDuration(duration)}
            >
              <Text style={[
                styles.durationNumber,
                selectedDuration === duration && styles.durationNumberSelected
              ]}>
                {duration}
              </Text>
              <Text style={[
                styles.durationText,
                selectedDuration === duration && styles.durationTextSelected
              ]}>
                minutes
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={startMeditation}
        >
          <Text style={styles.startButtonIcon}>🧘‍♀️</Text>
          <Text style={styles.startButtonText}>Begin Meditation</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(dashboard)/history')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📚</Text>
            </View>
            <Text style={styles.actionTitle}>Session History</Text>
            <Text style={styles.actionDescription}>
              View your past meditation sessions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(dashboard)/profile')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>👤</Text>
            </View>
            <Text style={styles.actionTitle}>Profile</Text>
            <Text style={styles.actionDescription}>
              Manage your account settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Tip */}
      <View style={styles.tipSection}>
        <Text style={styles.tipTitle}>💡 Daily Tip</Text>
        <Text style={styles.tipText}>
          Try focusing on your breath for the first minute. Inhale deeply through your nose, 
          exhale slowly through your mouth. This helps center your mind.
        </Text>
      </View>

      {/* Recent Activity */}
      {sessions.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Activity</Text>
          <View style={styles.recentList}>
            {sessions.slice(0, 3).map((session, index) => (
              <View key={session.id} style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <Text style={styles.recentIconText}>🎯</Text>
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentDuration}>
                    {Math.floor(session.actualDuration / 60)}m meditation
                  </Text>
                  <Text style={styles.recentTime}>
                    {new Date(session.completedAt || session.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[
                  styles.recentStatus,
                  session.completed ? styles.completed : styles.incomplete
                ]}>
                  {session.completed ? '✓' : '○'}
                </Text>
              </View>
            ))}
          </View>
          {sessions.length > 3 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/(dashboard)/history')}
            >
              <Text style={styles.viewAllText}>View All Sessions</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}
