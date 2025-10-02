import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Alert,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { MeditationTimer } from '@/utils/timerUtils';

const { width } = Dimensions.get('window');

export default function TimerScreen() {
  const { timerState, setTimerState, addSession, user } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(timerState.timeRemaining);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  
  const timerRef = useRef<MeditationTimer | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initialize timer
    timerRef.current = new MeditationTimer(
      timerState.totalDuration / 60, // Convert back to minutes
      (remaining) => {
        setTimeRemaining(remaining);
        setTimerState(prev => ({ ...prev, timeRemaining: remaining }));
        updateProgressAnimation();
      },
      onTimerComplete
    );

    return () => {
      if (timerRef.current) {
        timerRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    updateProgressAnimation();
  }, [timeRemaining]);

  const updateProgressAnimation = () => {
    const progress = getProgress();
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false
    }).start();
  };

  const onTimerComplete = async () => {
    // Celebration effects
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    setShowCompletion(true);
    
    // Scale animation for completion
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    // Save completed session
    if (user) {
      try {
        await addSession({
          duration: timerState.totalDuration / 60, // in minutes
          actualDuration: timerState.totalDuration, // in seconds
          completed: true,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        });
        
        // Show completion message after a delay
        setTimeout(() => {
          Alert.alert(
            '🎉 Session Complete!',
            'Great job! Your meditation session has been saved.',
            [
              { 
                text: 'View History', 
                onPress: () => router.push('/(dashboard)/history')
              },
              { 
                text: 'Home', 
                onPress: () => router.back(),
                style: 'default'
              }
            ]
          );
        }, 1500);
      } catch (error) {
        Alert.alert('Error', 'Failed to save session');
      }
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      timerRef.current.start();
      setIsRunning(true);
      setIsPaused(false);
      setShowCompletion(false);
      setTimerState(prev => ({ ...prev, isRunning: true, isPaused: false }));
    }
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      timerRef.current.pause();
      setIsRunning(false);
      setIsPaused(true);
      setTimerState(prev => ({ ...prev, isRunning: false, isPaused: true }));
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      timerRef.current.reset();
      setTimeRemaining(timerState.totalDuration);
      setIsRunning(false);
      setIsPaused(false);
      setShowCompletion(false);
      setTimerState(prev => ({ 
        ...prev, 
        isRunning: false, 
        isPaused: false,
        timeRemaining: timerState.totalDuration
      }));
      progressAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    return 1 - (timeRemaining / timerState.totalDuration);
  };

  const getBreathingPhase = (): string => {
    if (!isRunning) return 'Ready to begin';
    
    const cycleTime = timeRemaining % 20; // 20-second breathing cycle
    if (cycleTime < 4) return 'Breathe in...';
    if (cycleTime < 8) return 'Hold...';
    if (cycleTime < 12) return 'Breathe out...';
    return 'Hold...';
  };

  const getMotivationalMessage = (): string => {
    if (showCompletion) {
      return 'Excellent! You completed your meditation.';
    }
    if (!isRunning && !isPaused) {
      return 'Find a comfortable position. Close your eyes and begin when ready.';
    }
    if (isPaused) {
      return 'Session paused. Take a moment if needed.';
    }
    
    const messages = [
      'Focus on your breath. Inhale peace, exhale tension.',
      'Let thoughts come and go like clouds in the sky.',
      'Be present in this moment. Nothing else exists.',
      'Feel the stillness within you.',
      'Every breath brings you closer to peace.',
      'Release all expectations. Just be.',
      'You are exactly where you need to be.'
    ];
    
    const messageIndex = Math.floor(timeRemaining / 30) % messages.length;
    return messages[messageIndex];
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meditation Timer</Text>
        <Text style={styles.duration}>
          {timerState.totalDuration / 60} minute session
        </Text>
      </View>

      {/* Timer Display */}
      <View style={styles.timerDisplay}>
        <Animated.Text 
          style={[
            styles.timerText,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {formatTime(timeRemaining)}
        </Animated.Text>
        
        {/* Breathing Indicator */}
        {isRunning && (
          <View style={styles.breathingContainer}>
            <Text style={styles.breathingText}>{getBreathingPhase()}</Text>
            <View style={styles.breathingAnimation}>
              <View style={[
                styles.breathingDot,
                { opacity: (timeRemaining % 20) < 10 ? 0.3 : 1 }
              ]} />
            </View>
          </View>
        )}

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { width: progressWidth }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(getProgress() * 100)}% Complete
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {showCompletion ? (
          <View style={styles.completionContainer}>
            <Text style={styles.completionText}>🎉 Session Complete!</Text>
          </View>
        ) : (
          <>
            {!isRunning && !isPaused ? (
              <TouchableOpacity 
                style={[styles.controlButton, styles.startButton]}
                onPress={startTimer}
              >
                <Text style={styles.controlButtonText}>Start Meditation</Text>
              </TouchableOpacity>
            ) : isRunning ? (
              <TouchableOpacity 
                style={[styles.controlButton, styles.pauseButton]}
                onPress={pauseTimer}
              >
                <Text style={styles.controlButtonText}>Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.controlButton, styles.resumeButton]}
                onPress={startTimer}
              >
                <Text style={styles.controlButtonText}>Resume</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.resetButton]}
              onPress={resetTimer}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Meditation Guidance */}
      <View style={styles.guidance}>
        <Text style={styles.guidanceTitle}>Mindfulness Guide</Text>
        <Text style={styles.guidanceText}>
          {getMotivationalMessage()}
        </Text>
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Session Duration</Text>
          <Text style={styles.infoValue}>{timerState.totalDuration / 60} min</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Time Remaining</Text>
          <Text style={styles.infoValue}>{formatTime(timeRemaining)}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.back()}
        >
          <Text style={styles.quickActionText}>← Back to Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push('/(dashboard)/history')}
        >
          <Text style={styles.quickActionText}>View History →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 24,
    justifyContent: 'space-between'
  },
  header: {
    alignItems: 'center',
    marginTop: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 8
  },
  duration: {
    fontSize: 16,
    color: '#666'
  },
  timerDisplay: {
    alignItems: 'center',
    marginVertical: 40
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 20,
    textShadowColor: 'rgba(74, 101, 114, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  breathingContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  breathingText: {
    fontSize: 16,
    color: '#4A6572',
    fontWeight: '500',
    marginBottom: 8
  },
  breathingAnimation: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  breathingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A6572',
    marginHorizontal: 4
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center'
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A6572',
    borderRadius: 4
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  controls: {
    alignItems: 'center',
    marginBottom: 30
  },
  controlButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 160,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  startButton: {
    backgroundColor: '#4A6572'
  },
  pauseButton: {
    backgroundColor: '#FF9800'
  },
  resumeButton: {
    backgroundColor: '#4CAF50'
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  controlButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  resetButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold'
  },
  completionContainer: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center'
  },
  completionText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  guidance: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 12,
    textAlign: 'center'
  },
  guidanceText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  sessionInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  infoItem: {
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  quickActionButton: {
    padding: 12,
    borderRadius: 8
  },
  quickActionText: {
    color: '#4A6572',
    fontSize: 14,
    fontWeight: '500'
  }
});