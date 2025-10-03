 
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
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HomeScreen() {
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
      "You are exactly where you need to be.",
      "Let go of what was, have faith in what will be.",
      "Inhale courage, exhale fear.",
      "Your mind is a garden. Your thoughts are the seeds.",
      "Be present in all things and thankful for all things.",
      "Quiet the mind and the soul will speak."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  if (loading && sessions.length === 0) {
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
              <Icon name="check-circle" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Icon name="access-time" size={20} color="#2196F3" />
            </View>
            <Text style={styles.statNumber}>{formatTime(stats.totalMinutes)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Icon name="trending-up" size={20} color="#FF9800" />
            </View>
            <Text style={styles.statNumber}>
              {stats.averageSessionTime || 0}m
            </Text>
            <Text style={styles.statLabel}>Avg. Session</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Icon name="local-fire-department" size={20} color="#E91E63" />
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
          <Icon name="self-improvement" size={24} color="white" />
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
              <Icon name="history" size={24} color="#4A6572" />
            </View>
            <Text style={styles.actionTitle}>Session History</Text>
            <Text style={styles.actionDescription}>
              View your past meditation sessions and progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(dashboard)/profile')}
          >
            <View style={styles.actionIcon}>
              <Icon name="person" size={24} color="#4A6572" />
            </View>
            <Text style={styles.actionTitle}>Profile & Settings</Text>
            <Text style={styles.actionDescription}>
              Manage your account and app preferences
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Tip */}
      <View style={styles.tipSection}>
        <View style={styles.tipHeader}>
          <Icon name="lightbulb" size={20} color="#FFC107" />
          <Text style={styles.tipTitle}>Daily Tip</Text>
        </View>
        <Text style={styles.tipText}>
          Try focusing on your breath for the first minute. Inhale deeply through your nose, 
          exhale slowly through your mouth. This simple practice helps center your mind 
          and prepares you for a deeper meditation experience.
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
                  <Icon 
                    name={session.completed ? "check-circle" : "schedule"} 
                    size={20} 
                    color={session.completed ? "#4CAF50" : "#FF9800"} 
                  />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentDuration}>
                    {Math.floor(session.actualDuration / 60)}m meditation
                  </Text>
                  <Text style={styles.recentTime}>
                    {new Date(session.completedAt || session.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[
                  styles.recentStatus,
                  session.completed ? styles.completed : styles.incomplete
                ]}>
                  <Icon 
                    name={session.completed ? "check" : "schedule"} 
                    size={16} 
                    color="white" 
                  />
                </View>
              </View>
            ))}
          </View>
          {sessions.length > 3 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/(dashboard)/history')}
            >
              <Text style={styles.viewAllText}>View All Sessions</Text>
              <Icon name="arrow-forward" size={16} color="#4A6572" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  welcomeSection: {
    padding: 24,
    backgroundColor: '#4A6572',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 32
  },
  greeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 4
  },
  userName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20
  },
  statsSection: {
    padding: 20,
    marginTop: -40
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 16,
    textAlign: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  quickStartSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 8,
    textAlign: 'center'
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24
  },
  durationButton: {
    flex: 1,
    minWidth: '30%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  durationButtonSelected: {
    backgroundColor: '#4A6572',
    borderColor: '#4A6572'
  },
  durationNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 4
  },
  durationNumberSelected: {
    color: 'white'
  },
  durationText: {
    fontSize: 12,
    color: '#666'
  },
  durationTextSelected: {
    color: 'rgba(255,255,255,0.9)'
  },
  startButton: {
    backgroundColor: '#4A6572',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#4A6572',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  actionsSection: {
    padding: 20
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 16
  },
  actionsGrid: {
    gap: 16
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 4
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    flex: 1
  },
  tipSection: {
    backgroundColor: '#fff9e6',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107'
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8F00'
  },
  tipText: {
    fontSize: 14,
    color: '#FF8F00',
    lineHeight: 20
  },
  recentSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 16
  },
  recentList: {
    gap: 12
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  recentInfo: {
    flex: 1
  },
  recentDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A6572',
    marginBottom: 2
  },
  recentTime: {
    fontSize: 12,
    color: '#666'
  },
  recentStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  completed: {
    backgroundColor: '#4CAF50'
  },
  incomplete: {
    backgroundColor: '#FF9800'
  },
  viewAllButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  viewAllText: {
    color: '#4A6572',
    fontSize: 14,
    fontWeight: '500'
  }
});